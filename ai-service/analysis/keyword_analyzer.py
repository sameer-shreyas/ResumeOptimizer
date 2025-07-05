import asyncio
from typing import Dict, List, Set
from collections import Counter
import re
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class KeywordAnalyzer:
    def __init__(self):
        self.tech_keywords = self._load_tech_keywords()
        self.soft_skills = self._load_soft_skills()
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=1000,
            stop_words='english',
            ngram_range=(1, 3)
        )
        self._is_loaded = True
    
    async def initialize(self):
        """Initialize the keyword analyzer"""
        pass
    
    def is_loaded(self) -> bool:
        return self._is_loaded
    
    async def analyze(self, resume_data: Dict, job_desc_data: Dict) -> Dict:
        """
        Analyze keyword matching between resume and job description
        """
        resume_text = resume_data["cleaned_text"]
        job_desc_text = job_desc_data["cleaned_text"]
        
        # Extract keywords from job description
        job_keywords = self._extract_keywords(job_desc_text)
        
        # Extract keywords from resume
        resume_keywords = self._extract_keywords(resume_text)
        
        # Find matches
        matched_keywords = self._find_matches(job_keywords, resume_keywords)
        missing_keywords = job_keywords - resume_keywords
        
        # Calculate TF-IDF similarity
        tfidf_score = self._calculate_tfidf_similarity(resume_text, job_desc_text)
        
        # Calculate keyword density
        keyword_density = self._calculate_keyword_density(resume_text, job_keywords)
        
        # Calculate final keyword score
        match_ratio = len(matched_keywords) / max(len(job_keywords), 1)
        keyword_score = int((match_ratio * 0.7 + tfidf_score * 0.3) * 100)
        
        return {
            "score": min(keyword_score, 100),
            "matched_keywords": list(matched_keywords),
            "missing_keywords": list(missing_keywords),
            "job_keywords": list(job_keywords),
            "resume_keywords": list(resume_keywords),
            "match_ratio": match_ratio,
            "tfidf_score": tfidf_score,
            "keyword_density": keyword_density
        }
    
    def _load_tech_keywords(self) -> Set[str]:
        """Load technical keywords and skills"""
        return {
            # Programming Languages
            'python', 'java', 'javascript', 'typescript', 'c++', 'c#', 'php', 'ruby', 'go', 'rust',
            'swift', 'kotlin', 'scala', 'r', 'matlab', 'sql', 'html', 'css', 'sass', 'less',
            
            # Frameworks & Libraries
            'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'laravel',
            'rails', 'asp.net', 'jquery', 'bootstrap', 'tailwind', 'material-ui', 'redux', 'vuex',
            
            # Databases
            'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'oracle',
            'sqlite', 'dynamodb', 'firebase', 'supabase',
            
            # Cloud & DevOps
            'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github', 'terraform',
            'ansible', 'chef', 'puppet', 'vagrant', 'ci/cd', 'devops',
            
            # Tools & Technologies
            'git', 'svn', 'jira', 'confluence', 'slack', 'teams', 'figma', 'sketch', 'photoshop',
            'illustrator', 'postman', 'swagger', 'api', 'rest', 'graphql', 'microservices',
            
            # Methodologies
            'agile', 'scrum', 'kanban', 'waterfall', 'lean', 'tdd', 'bdd', 'pair programming',
            
            # Data & AI
            'machine learning', 'deep learning', 'ai', 'data science', 'analytics', 'big data',
            'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras', 'spark', 'hadoop'
        }
    
    def _load_soft_skills(self) -> Set[str]:
        """Load soft skills keywords"""
        return {
            'leadership', 'communication', 'teamwork', 'problem solving', 'analytical',
            'creative', 'innovative', 'adaptable', 'flexible', 'organized', 'detail-oriented',
            'time management', 'project management', 'collaboration', 'mentoring', 'training'
        }
    
    def _extract_keywords(self, text: str) -> Set[str]:
        """Extract relevant keywords from text"""
        text_lower = text.lower()
        keywords = set()
        
        # Extract tech keywords
        for keyword in self.tech_keywords:
            if keyword in text_lower:
                keywords.add(keyword)
        
        # Extract soft skills
        for skill in self.soft_skills:
            if skill in text_lower:
                keywords.add(skill)
        
        # Extract years of experience patterns
        exp_patterns = re.findall(r'(\d+)\+?\s*years?\s*(?:of\s*)?(?:experience|exp)', text_lower)
        for exp in exp_patterns:
            keywords.add(f"{exp} years experience")
        
        # Extract degree patterns
        degree_patterns = re.findall(r'(bachelor|master|phd|doctorate|associate)(?:\s*of\s*|\s+)(\w+)', text_lower)
        for degree, field in degree_patterns:
            keywords.add(f"{degree} {field}")
        
        return keywords
    
    def _find_matches(self, job_keywords: Set[str], resume_keywords: Set[str]) -> Set[str]:
        """Find matching keywords with fuzzy matching"""
        matches = set()
        
        for job_keyword in job_keywords:
            for resume_keyword in resume_keywords:
                # Exact match
                if job_keyword == resume_keyword:
                    matches.add(job_keyword)
                # Partial match for compound terms
                elif job_keyword in resume_keyword or resume_keyword in job_keyword:
                    if len(job_keyword) > 3 and len(resume_keyword) > 3:
                        matches.add(job_keyword)
        
        return matches
    
    def _calculate_tfidf_similarity(self, resume_text: str, job_desc_text: str) -> float:
        """Calculate TF-IDF cosine similarity"""
        try:
            documents = [resume_text, job_desc_text]
            tfidf_matrix = self.tfidf_vectorizer.fit_transform(documents)
            similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
            return float(similarity)
        except:
            return 0.0
    
    def _calculate_keyword_density(self, text: str, keywords: Set[str]) -> Dict[str, float]:
        """Calculate keyword density in text"""
        text_lower = text.lower()
        word_count = len(text_lower.split())
        
        density = {}
        for keyword in keywords:
            count = text_lower.count(keyword.lower())
            density[keyword] = count / word_count if word_count > 0 else 0
        
        return density