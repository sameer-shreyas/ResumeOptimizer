from typing import Dict, Any

class ScoringEngine:
    def __init__(self):
        # Scoring weights for different analysis types
        self.weights = {
            "full": {
                "keyword": 0.4,
                "semantic": 0.4,
                "structure": 0.2
            },
            "quick": {
                "keyword": 0.6,
                "semantic": 0.2,
                "structure": 0.2
            },
            "keywords_only": {
                "keyword": 1.0,
                "semantic": 0.0,
                "structure": 0.0
            }
        }
    
    def calculate_score(self, keyword_results: Dict, semantic_results: Dict, structure_results: Dict, analysis_type: str = "full") -> int:
        """
        Calculate final ATS score based on different analysis components
        """
        weights = self.weights.get(analysis_type, self.weights["full"])
        
        # Get individual scores
        keyword_score = keyword_results.get("score", 0)
        semantic_score = semantic_results.get("score", 0) if semantic_results else 0
        structure_score = structure_results.get("score", 0)
        
        # Apply weights
        final_score = (
            keyword_score * weights["keyword"] +
            semantic_score * weights["semantic"] +
            structure_score * weights["structure"]
        )
        
        # Apply bonus/penalty adjustments
        final_score = self._apply_adjustments(
            final_score, 
            keyword_results, 
            semantic_results, 
            structure_results
        )
        
        return int(min(max(final_score, 0), 100))
    
    def _apply_adjustments(self, base_score: float, keyword_results: Dict, semantic_results: Dict, structure_results: Dict) -> float:
        """
        Apply bonus and penalty adjustments to the base score
        """
        adjusted_score = base_score
        
        # Keyword-based adjustments
        match_ratio = keyword_results.get("match_ratio", 0)
        if match_ratio > 0.8:
            adjusted_score += 5  # Bonus for high keyword match
        elif match_ratio < 0.3:
            adjusted_score -= 5  # Penalty for low keyword match
        
        # Structure-based adjustments
        if structure_results:
            missing_sections = structure_results.get("section_analysis", {}).get("missing_sections", [])
            if len(missing_sections) == 0:
                adjusted_score += 3  # Bonus for complete sections
            elif len(missing_sections) > 2:
                adjusted_score -= 5  # Penalty for many missing sections
            
            format_analysis = structure_results.get("format_analysis", {})
            if format_analysis.get("has_quantified_achievements", False):
                adjusted_score += 3  # Bonus for quantified achievements
            
            if format_analysis.get("has_action_verbs", False):
                adjusted_score += 2  # Bonus for action verbs
        
        # Semantic-based adjustments
        if semantic_results:
            overall_similarity = semantic_results.get("overall_similarity", 0)
            if overall_similarity > 0.7:
                adjusted_score += 3  # Bonus for high semantic similarity
            elif overall_similarity < 0.3:
                adjusted_score -= 3  # Penalty for low semantic similarity
        
        return adjusted_score
    
    def get_score_breakdown(self, keyword_results: Dict, semantic_results: Dict, structure_results: Dict, analysis_type: str = "full") -> Dict[str, Any]:
        """
        Get detailed breakdown of how the score was calculated
        """
        weights = self.weights.get(analysis_type, self.weights["full"])
        
        keyword_score = keyword_results.get("score", 0)
        semantic_score = semantic_results.get("score", 0) if semantic_results else 0
        structure_score = structure_results.get("score", 0)
        
        breakdown = {
            "components": {
                "keyword": {
                    "score": keyword_score,
                    "weight": weights["keyword"],
                    "weighted_score": keyword_score * weights["keyword"]
                },
                "semantic": {
                    "score": semantic_score,
                    "weight": weights["semantic"],
                    "weighted_score": semantic_score * weights["semantic"]
                },
                "structure": {
                    "score": structure_score,
                    "weight": weights["structure"],
                    "weighted_score": structure_score * weights["structure"]
                }
            },
            "base_score": sum(comp["weighted_score"] for comp in breakdown["components"].values()),
            "analysis_type": analysis_type
        }
        
        return breakdown