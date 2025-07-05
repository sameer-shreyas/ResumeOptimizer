from typing import Dict, List, Any
import uuid

class SuggestionGenerator:
    def __init__(self):
        self.suggestion_templates = {
            "missing_keywords": {
                "type": "critical",
                "title": "Add Missing Keywords",
                "description": "Your resume is missing important keywords from the job description.",
                "impact": "high"
            },
            "low_keyword_density": {
                "type": "warning", 
                "title": "Increase Keyword Density",
                "description": "Consider using job-relevant keywords more frequently throughout your resume.",
                "impact": "medium"
            },
            "missing_sections": {
                "type": "critical",
                "title": "Add Missing Sections",
                "description": "Your resume is missing essential sections.",
                "impact": "high"
            },
            "no_quantified_achievements": {
                "type": "warning",
                "title": "Quantify Your Achievements",
                "description": "Add numbers and metrics to make your accomplishments more impactful.",
                "impact": "medium"
            },
            "no_action_verbs": {
                "type": "improvement",
                "title": "Use Strong Action Verbs",
                "description": "Start bullet points with powerful action verbs to grab attention.",
                "impact": "medium"
            },
            "poor_formatting": {
                "type": "warning",
                "title": "Improve ATS Formatting",
                "description": "Ensure your resume uses ATS-friendly formatting.",
                "impact": "medium"
            },
            "low_semantic_match": {
                "type": "improvement",
                "title": "Improve Content Relevance",
                "description": "Align your experience descriptions more closely with the job requirements.",
                "impact": "medium"
            },
            "section_quality": {
                "type": "improvement",
                "title": "Enhance Section Content",
                "description": "Improve the quality and organization of your resume sections.",
                "impact": "low"
            }
        }
    
    def generate_suggestions(self, keyword_results: Dict, semantic_results: Dict, structure_results: Dict, score: int) -> List[Dict[str, Any]]:
        """
        Generate actionable suggestions based on analysis results
        """
        suggestions = []
        
        # Keyword-based suggestions
        suggestions.extend(self._generate_keyword_suggestions(keyword_results))
        
        # Structure-based suggestions
        suggestions.extend(self._generate_structure_suggestions(structure_results))
        
        # Semantic-based suggestions
        if semantic_results:
            suggestions.extend(self._generate_semantic_suggestions(semantic_results))
        
        # Score-based suggestions
        suggestions.extend(self._generate_score_based_suggestions(score))
        
        # Sort by impact and limit to most important
        suggestions = self._prioritize_suggestions(suggestions)
        
        return suggestions[:8]  # Limit to top 8 suggestions
    
    def _generate_keyword_suggestions(self, keyword_results: Dict) -> List[Dict[str, Any]]:
        """Generate suggestions based on keyword analysis"""
        suggestions = []
        
        missing_keywords = keyword_results.get("missing_keywords", [])
        match_ratio = keyword_results.get("match_ratio", 0)
        
        if missing_keywords:
            template = self.suggestion_templates["missing_keywords"]
            suggestions.append({
                "id": str(uuid.uuid4()),
                "type": template["type"],
                "title": template["title"],
                "description": template["description"],
                "example": f"Consider adding these keywords: {', '.join(missing_keywords[:5])}",
                "impact": template["impact"]
            })
        
        if match_ratio < 0.5:
            template = self.suggestion_templates["low_keyword_density"]
            suggestions.append({
                "id": str(uuid.uuid4()),
                "type": template["type"],
                "title": template["title"],
                "description": template["description"],
                "example": "Use relevant keywords naturally throughout your experience descriptions",
                "impact": template["impact"]
            })
        
        return suggestions
    
    def _generate_structure_suggestions(self, structure_results: Dict) -> List[Dict[str, Any]]:
        """Generate suggestions based on structure analysis"""
        suggestions = []
        
        if not structure_results:
            return suggestions
        
        section_analysis = structure_results.get("section_analysis", {})
        format_analysis = structure_results.get("format_analysis", {})
        content_analysis = structure_results.get("content_analysis", {})
        
        # Missing sections
        missing_sections = section_analysis.get("missing_sections", [])
        if missing_sections:
            template = self.suggestion_templates["missing_sections"]
            suggestions.append({
                "id": str(uuid.uuid4()),
                "type": template["type"],
                "title": template["title"],
                "description": template["description"],
                "example": f"Add these sections: {', '.join(missing_sections)}",
                "impact": template["impact"]
            })
        
        # Quantified achievements
        if not content_analysis.get("has_quantified_achievements", False):
            template = self.suggestion_templates["no_quantified_achievements"]
            suggestions.append({
                "id": str(uuid.uuid4()),
                "type": template["type"],
                "title": template["title"],
                "description": template["description"],
                "example": "Instead of 'Improved performance', write 'Improved application performance by 40%'",
                "impact": template["impact"]
            })
        
        # Action verbs
        if not content_analysis.get("has_action_verbs", False):
            template = self.suggestion_templates["no_action_verbs"]
            suggestions.append({
                "id": str(uuid.uuid4()),
                "type": template["type"],
                "title": template["title"],
                "description": template["description"],
                "example": "Use 'Developed', 'Implemented', 'Led' instead of 'Responsible for'",
                "impact": template["impact"]
            })
        
        # Formatting issues
        formatting_issues = format_analysis.get("formatting_issues", [])
        if formatting_issues:
            template = self.suggestion_templates["poor_formatting"]
            suggestions.append({
                "id": str(uuid.uuid4()),
                "type": template["type"],
                "title": template["title"],
                "description": template["description"],
                "example": f"Fix these issues: {', '.join(formatting_issues[:3])}",
                "impact": template["impact"]
            })
        
        return suggestions
    
    def _generate_semantic_suggestions(self, semantic_results: Dict) -> List[Dict[str, Any]]:
        """Generate suggestions based on semantic analysis"""
        suggestions = []
        
        overall_similarity = semantic_results.get("overall_similarity", 0)
        
        if overall_similarity < 0.4:
            template = self.suggestion_templates["low_semantic_match"]
            suggestions.append({
                "id": str(uuid.uuid4()),
                "type": template["type"],
                "title": template["title"],
                "description": template["description"],
                "example": "Rewrite experience descriptions to better match job requirements and responsibilities",
                "impact": template["impact"]
            })
        
        return suggestions
    
    def _generate_score_based_suggestions(self, score: int) -> List[Dict[str, Any]]:
        """Generate suggestions based on overall score"""
        suggestions = []
        
        if score < 60:
            suggestions.append({
                "id": str(uuid.uuid4()),
                "type": "critical",
                "title": "Comprehensive Resume Overhaul Needed",
                "description": "Your resume needs significant improvements to pass ATS screening.",
                "example": "Focus on adding relevant keywords, improving formatting, and quantifying achievements",
                "impact": "high"
            })
        elif score < 80:
            suggestions.append({
                "id": str(uuid.uuid4()),
                "type": "improvement",
                "title": "Fine-tune Your Resume",
                "description": "Your resume is good but could benefit from targeted improvements.",
                "example": "Focus on the highest-impact suggestions to reach the 80+ score range",
                "impact": "medium"
            })
        
        return suggestions
    
    def _prioritize_suggestions(self, suggestions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Prioritize suggestions by impact and type"""
        impact_order = {"high": 3, "medium": 2, "low": 1}
        type_order = {"critical": 3, "warning": 2, "improvement": 1}
        
        def suggestion_priority(suggestion):
            impact_score = impact_order.get(suggestion["impact"], 0)
            type_score = type_order.get(suggestion["type"], 0)
            return impact_score * 10 + type_score
        
        return sorted(suggestions, key=suggestion_priority, reverse=True)