import re
from typing import Dict, List
import asyncio

class StructureAnalyzer:
    def __init__(self):
        self.required_sections = {
            'contact': ['contact', 'personal information'],
            'experience': ['experience', 'employment', 'work history', 'professional experience'],
            'education': ['education', 'academic', 'qualifications'],
            'skills': ['skills', 'technical skills', 'competencies', 'technologies']
        }
        
        self.ats_friendly_patterns = {
            'bullet_points': r'^\s*[•\-\*]\s+',
            'section_headers': r'^[A-Z\s]+$',
            'dates': r'\b\d{4}\b|\b\d{1,2}/\d{4}\b|\b\w+\s+\d{4}\b',
            'phone_numbers': r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        }
    
    async def analyze(self, resume_data: Dict) -> Dict:
        """
        Analyze resume structure for ATS compatibility
        """
        text = resume_data["original_text"]
        sections = resume_data.get("sections", {})
        
        # Check section completeness
        section_analysis = self._analyze_sections(sections)
        
        # Check ATS-friendly formatting
        format_analysis = self._analyze_formatting(text)
        
        # Check content structure
        content_analysis = self._analyze_content_structure(text, sections)
        
        # Calculate structure score
        structure_score = self._calculate_structure_score(
            section_analysis, 
            format_analysis, 
            content_analysis
        )
        
        return {
            "score": structure_score,
            "section_analysis": section_analysis,
            "format_analysis": format_analysis,
            "content_analysis": content_analysis,
            "recommendations": self._generate_structure_recommendations(
                section_analysis, format_analysis, content_analysis
            )
        }
    
    def _analyze_sections(self, sections: Dict[str, str]) -> Dict:
        """Analyze presence and quality of resume sections"""
        analysis = {
            "present_sections": list(sections.keys()),
            "missing_sections": [],
            "section_quality": {}
        }
        
        # Check for required sections
        for section_key, section_names in self.required_sections.items():
            found = False
            for section_name in sections.keys():
                if any(name.lower() in section_name.lower() for name in section_names):
                    found = True
                    break
            
            if not found:
                analysis["missing_sections"].append(section_key)
        
        # Analyze section quality
        for section_name, content in sections.items():
            quality = self._assess_section_quality(section_name, content)
            analysis["section_quality"][section_name] = quality
        
        return analysis
    
    def _analyze_formatting(self, text: str) -> Dict:
        """Analyze ATS-friendly formatting"""
        lines = text.split('\n')
        
        analysis = {
            "has_bullet_points": False,
            "has_clear_headers": False,
            "has_dates": False,
            "has_contact_info": False,
            "line_count": len(lines),
            "formatting_issues": []
        }
        
        # Check for bullet points
        bullet_count = sum(1 for line in lines if re.search(self.ats_friendly_patterns['bullet_points'], line))
        analysis["has_bullet_points"] = bullet_count > 0
        analysis["bullet_point_count"] = bullet_count
        
        # Check for clear section headers
        header_count = sum(1 for line in lines if re.match(self.ats_friendly_patterns['section_headers'], line.strip()))
        analysis["has_clear_headers"] = header_count >= 3
        analysis["header_count"] = header_count
        
        # Check for dates
        date_matches = re.findall(self.ats_friendly_patterns['dates'], text)
        analysis["has_dates"] = len(date_matches) > 0
        analysis["date_count"] = len(date_matches)
        
        # Check for contact information
        phone_matches = re.findall(self.ats_friendly_patterns['phone_numbers'], text)
        email_matches = re.findall(self.ats_friendly_patterns['email'], text)
        analysis["has_contact_info"] = len(phone_matches) > 0 or len(email_matches) > 0
        analysis["phone_count"] = len(phone_matches)
        analysis["email_count"] = len(email_matches)
        
        # Check for formatting issues
        if not analysis["has_bullet_points"]:
            analysis["formatting_issues"].append("No bullet points found")
        
        if not analysis["has_clear_headers"]:
            analysis["formatting_issues"].append("Insufficient clear section headers")
        
        if not analysis["has_contact_info"]:
            analysis["formatting_issues"].append("Missing contact information")
        
        return analysis
    
    def _analyze_content_structure(self, text: str, sections: Dict[str, str]) -> Dict:
        """Analyze content structure and organization"""
        analysis = {
            "word_count": len(text.split()),
            "has_quantified_achievements": False,
            "has_action_verbs": False,
            "content_density": {},
            "readability_score": 0
        }
        
        # Check for quantified achievements
        number_patterns = r'\b\d+%|\b\d+\+|\b\d+[kmb]?\b|\$\d+|\d+x\b'
        quantified_matches = re.findall(number_patterns, text.lower())
        analysis["has_quantified_achievements"] = len(quantified_matches) > 0
        analysis["quantified_achievement_count"] = len(quantified_matches)
        
        # Check for action verbs
        action_verbs = [
            'achieved', 'developed', 'implemented', 'managed', 'led', 'created', 'designed',
            'improved', 'increased', 'reduced', 'optimized', 'delivered', 'executed',
            'coordinated', 'supervised', 'trained', 'mentored', 'analyzed', 'researched'
        ]
        
        text_lower = text.lower()
        action_verb_count = sum(1 for verb in action_verbs if verb in text_lower)
        analysis["has_action_verbs"] = action_verb_count > 0
        analysis["action_verb_count"] = action_verb_count
        
        # Analyze content density by section
        for section_name, content in sections.items():
            words = len(content.split())
            lines = len(content.split('\n'))
            analysis["content_density"][section_name] = {
                "word_count": words,
                "line_count": lines,
                "words_per_line": words / max(lines, 1)
            }
        
        # Simple readability score (based on sentence length and word complexity)
        sentences = text.split('.')
        avg_sentence_length = sum(len(s.split()) for s in sentences) / max(len(sentences), 1)
        analysis["readability_score"] = min(100, max(0, 100 - (avg_sentence_length - 15) * 2))
        
        return analysis
    
    def _assess_section_quality(self, section_name: str, content: str) -> Dict:
        """Assess the quality of a specific section"""
        words = content.split()
        lines = content.split('\n')
        
        quality = {
            "word_count": len(words),
            "line_count": len(lines),
            "has_bullet_points": bool(re.search(self.ats_friendly_patterns['bullet_points'], content)),
            "has_dates": bool(re.search(self.ats_friendly_patterns['dates'], content)),
            "quality_score": 0
        }
        
        # Calculate quality score based on section type
        if 'experience' in section_name.lower():
            # Experience sections should have dates, bullet points, and quantified achievements
            score = 0
            if quality["has_dates"]: score += 30
            if quality["has_bullet_points"]: score += 30
            if len(words) > 50: score += 20
            if re.search(r'\b\d+', content): score += 20  # Numbers/metrics
            quality["quality_score"] = score
            
        elif 'skills' in section_name.lower():
            # Skills sections should be concise and well-organized
            score = 0
            if len(words) > 10: score += 40
            if len(words) < 100: score += 30  # Not too verbose
            if ',' in content or '\n' in content: score += 30  # Organized
            quality["quality_score"] = score
            
        else:
            # General quality assessment
            score = 0
            if len(words) > 10: score += 50
            if quality["has_bullet_points"]: score += 25
            if len(lines) > 1: score += 25
            quality["quality_score"] = score
        
        return quality
    
    def _calculate_structure_score(self, section_analysis: Dict, format_analysis: Dict, content_analysis: Dict) -> int:
        """Calculate overall structure score"""
        score = 0
        
        # Section completeness (40% of score)
        required_sections = len(self.required_sections)
        missing_sections = len(section_analysis["missing_sections"])
        section_score = ((required_sections - missing_sections) / required_sections) * 40
        score += section_score
        
        # Formatting (35% of score)
        format_score = 0
        if format_analysis["has_bullet_points"]: format_score += 10
        if format_analysis["has_clear_headers"]: format_score += 10
        if format_analysis["has_dates"]: format_score += 8
        if format_analysis["has_contact_info"]: format_score += 7
        score += format_score
        
        # Content structure (25% of score)
        content_score = 0
        if content_analysis["has_quantified_achievements"]: content_score += 10
        if content_analysis["has_action_verbs"]: content_score += 8
        if content_analysis["word_count"] > 200: content_score += 4
        if content_analysis["readability_score"] > 70: content_score += 3
        score += content_score
        
        return int(min(score, 100))
    
    def _generate_structure_recommendations(self, section_analysis: Dict, format_analysis: Dict, content_analysis: Dict) -> List[str]:
        """Generate recommendations for improving resume structure"""
        recommendations = []
        
        # Section recommendations
        if section_analysis["missing_sections"]:
            for section in section_analysis["missing_sections"]:
                recommendations.append(f"Add a {section.title()} section to your resume")
        
        # Formatting recommendations
        if not format_analysis["has_bullet_points"]:
            recommendations.append("Use bullet points to organize your experience and achievements")
        
        if not format_analysis["has_clear_headers"]:
            recommendations.append("Use clear, standard section headers (e.g., 'Professional Experience', 'Education')")
        
        if not format_analysis["has_contact_info"]:
            recommendations.append("Include complete contact information (phone, email)")
        
        # Content recommendations
        if not content_analysis["has_quantified_achievements"]:
            recommendations.append("Add numbers and metrics to quantify your achievements")
        
        if not content_analysis["has_action_verbs"]:
            recommendations.append("Start bullet points with strong action verbs")
        
        if content_analysis["word_count"] < 200:
            recommendations.append("Expand your resume content to better showcase your experience")
        
        return recommendations