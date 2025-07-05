import asyncio
from typing import Dict, List
import numpy as np
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import logging

logger = logging.getLogger(__name__)

class SemanticAnalyzer:
    def __init__(self):
        self.model = None
        self.model_name = 'sentence-transformers/all-MiniLM-L6-v2'
        self._is_loaded = False
    
    async def initialize(self):
        """Initialize the sentence transformer model"""
        try:
            logger.info(f"Loading semantic model: {self.model_name}")
            self.model = SentenceTransformer(self.model_name)
            self._is_loaded = True
            logger.info("Semantic model loaded successfully")
        except Exception as e:
            logger.error(f"Failed to load semantic model: {e}")
            self._is_loaded = False
    
    def is_loaded(self) -> bool:
        return self._is_loaded
    
    async def analyze(self, resume_data: Dict, job_desc_data: Dict) -> Dict:
        """
        Perform semantic similarity analysis between resume and job description
        """
        if not self._is_loaded:
            return {"score": 0, "error": "Model not loaded"}
        
        try:
            # Extract text content
            resume_text = resume_data["cleaned_text"]
            job_desc_text = job_desc_data["cleaned_text"]
            
            # Calculate overall semantic similarity
            overall_similarity = await self._calculate_similarity(resume_text, job_desc_text)
            
            # Calculate section-wise similarities
            section_similarities = await self._calculate_section_similarities(
                resume_data.get("sections", {}), 
                job_desc_data
            )
            
            # Calculate sentence-level similarities
            sentence_similarities = await self._calculate_sentence_similarities(
                resume_data.get("sentences", []), 
                job_desc_data.get("sentences", [])
            )
            
            # Calculate final semantic score
            semantic_score = self._calculate_semantic_score(
                overall_similarity,
                section_similarities,
                sentence_similarities
            )
            
            return {
                "score": semantic_score,
                "overall_similarity": overall_similarity,
                "section_similarities": section_similarities,
                "sentence_similarities": sentence_similarities,
                "top_matching_sentences": self._get_top_matches(sentence_similarities)
            }
            
        except Exception as e:
            logger.error(f"Error in semantic analysis: {e}")
            return {"score": 0, "error": str(e)}
    
    async def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate semantic similarity between two texts"""
        try:
            # Encode texts
            embeddings = self.model.encode([text1, text2])
            
            # Calculate cosine similarity
            similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
            
            return float(similarity)
        except Exception as e:
            logger.error(f"Error calculating similarity: {e}")
            return 0.0
    
    async def _calculate_section_similarities(self, resume_sections: Dict[str, str], job_desc_data: Dict) -> Dict[str, float]:
        """Calculate similarities between resume sections and job description"""
        section_similarities = {}
        job_desc_text = job_desc_data["cleaned_text"]
        
        for section_name, section_content in resume_sections.items():
            if section_content.strip():
                similarity = await self._calculate_similarity(section_content, job_desc_text)
                section_similarities[section_name] = similarity
        
        return section_similarities
    
    async def _calculate_sentence_similarities(self, resume_sentences: List[str], job_desc_sentences: List[str]) -> List[Dict]:
        """Calculate similarities between resume and job description sentences"""
        if not resume_sentences or not job_desc_sentences:
            return []
        
        similarities = []
        
        # Limit to top sentences to avoid performance issues
        max_sentences = 20
        resume_sentences = resume_sentences[:max_sentences]
        job_desc_sentences = job_desc_sentences[:max_sentences]
        
        try:
            # Encode all sentences at once for efficiency
            all_sentences = resume_sentences + job_desc_sentences
            embeddings = self.model.encode(all_sentences)
            
            resume_embeddings = embeddings[:len(resume_sentences)]
            job_desc_embeddings = embeddings[len(resume_sentences):]
            
            # Calculate similarities
            for i, resume_sentence in enumerate(resume_sentences):
                for j, job_desc_sentence in enumerate(job_desc_sentences):
                    similarity = cosine_similarity(
                        [resume_embeddings[i]], 
                        [job_desc_embeddings[j]]
                    )[0][0]
                    
                    similarities.append({
                        "resume_sentence": resume_sentence,
                        "job_desc_sentence": job_desc_sentence,
                        "similarity": float(similarity)
                    })
            
            # Sort by similarity
            similarities.sort(key=lambda x: x["similarity"], reverse=True)
            
        except Exception as e:
            logger.error(f"Error calculating sentence similarities: {e}")
        
        return similarities
    
    def _calculate_semantic_score(self, overall_similarity: float, section_similarities: Dict[str, float], sentence_similarities: List[Dict]) -> int:
        """Calculate final semantic score"""
        # Weight different components
        overall_weight = 0.4
        section_weight = 0.4
        sentence_weight = 0.2
        
        # Overall similarity component
        overall_component = overall_similarity * overall_weight
        
        # Section similarity component (average of top sections)
        if section_similarities:
            top_sections = sorted(section_similarities.values(), reverse=True)[:3]
            section_component = np.mean(top_sections) * section_weight
        else:
            section_component = 0
        
        # Sentence similarity component (average of top matches)
        if sentence_similarities:
            top_similarities = [s["similarity"] for s in sentence_similarities[:10]]
            sentence_component = np.mean(top_similarities) * sentence_weight
        else:
            sentence_component = 0
        
        # Calculate final score
        final_score = (overall_component + section_component + sentence_component) * 100
        
        return int(min(final_score, 100))
    
    def _get_top_matches(self, sentence_similarities: List[Dict], top_n: int = 5) -> List[Dict]:
        """Get top matching sentences"""
        return sentence_similarities[:top_n]