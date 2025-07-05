import re
import string
import asyncio
from typing import Dict, List
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.stem import WordNetLemmatizer

class TextProcessor:
    def __init__(self):
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        self._download_nltk_data()
    
    def _download_nltk_data(self):
        """Download required NLTK data"""
        try:
            nltk.data.find('tokenizers/punkt')
            nltk.data.find('corpora/stopwords')
            nltk.data.find('corpora/wordnet')
        except LookupError:
            nltk.download('punkt')
            nltk.download('stopwords')
            nltk.download('wordnet')
    
    async def process(self, text: str) -> Dict[str, any]:
        """
        Process text through cleaning, tokenization, and normalization
        """
        # Clean text
        cleaned_text = self._clean_text(text)
        
        # Tokenize
        sentences = sent_tokenize(cleaned_text)
        words = word_tokenize(cleaned_text.lower())
        
        # Remove stopwords and punctuation
        filtered_words = [
            word for word in words 
            if word not in self.stop_words and word not in string.punctuation
        ]
        
        # Lemmatize
        lemmatized_words = [self.lemmatizer.lemmatize(word) for word in filtered_words]
        
        # Extract sections
        sections = self._extract_sections(text)
        
        return {
            "original_text": text,
            "cleaned_text": cleaned_text,
            "sentences": sentences,
            "words": words,
            "filtered_words": filtered_words,
            "lemmatized_words": lemmatized_words,
            "sections": sections,
            "word_count": len(words),
            "sentence_count": len(sentences)
        }
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove special characters but keep basic punctuation
        text = re.sub(r'[^\w\s\.\,\;\:\!\?\-\(\)]', '', text)
        
        # Remove email addresses and phone numbers for privacy
        text = re.sub(r'\S+@\S+', '[EMAIL]', text)
        text = re.sub(r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b', '[PHONE]', text)
        
        return text.strip()
    
    def _extract_sections(self, text: str) -> Dict[str, str]:
        """Extract common resume sections"""
        sections = {}
        
        # Common section headers
        section_patterns = {
            'contact': r'(contact|personal information)',
            'summary': r'(summary|profile|objective)',
            'experience': r'(experience|employment|work history)',
            'education': r'(education|academic)',
            'skills': r'(skills|technical skills|competencies)',
            'projects': r'(projects|portfolio)',
            'certifications': r'(certifications|certificates)',
            'awards': r'(awards|achievements|honors)'
        }
        
        text_lower = text.lower()
        lines = text.split('\n')
        
        current_section = None
        section_content = []
        
        for line in lines:
            line_lower = line.lower().strip()
            
            # Check if line is a section header
            for section_name, pattern in section_patterns.items():
                if re.search(pattern, line_lower):
                    # Save previous section
                    if current_section and section_content:
                        sections[current_section] = '\n'.join(section_content)
                    
                    # Start new section
                    current_section = section_name
                    section_content = []
                    break
            else:
                # Add line to current section
                if current_section and line.strip():
                    section_content.append(line)
        
        # Save last section
        if current_section and section_content:
            sections[current_section] = '\n'.join(section_content)
        
        return sections