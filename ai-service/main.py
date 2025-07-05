from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import uvicorn
import logging
import asyncio
from datetime import datetime

# Import analysis modules
from analysis.text_processor import TextProcessor
from analysis.keyword_analyzer import KeywordAnalyzer
from analysis.semantic_analyzer import SemanticAnalyzer
from analysis.structure_analyzer import StructureAnalyzer
from analysis.scoring_engine import ScoringEngine
from analysis.suggestion_generator import SuggestionGenerator

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="ResumeOptim.AI Analysis Service",
    description="AI-powered resume analysis microservice",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class SuggestionModel(BaseModel):
    id: str
    type: str = Field(..., regex="^(critical|warning|improvement)$")
    title: str
    description: str
    example: Optional[str] = None
    impact: str = Field(..., regex="^(high|medium|low)$")

class AnalysisRequest(BaseModel):
    resume_text: str = Field(..., min_length=10, max_length=50000)
    job_description: str = Field(..., min_length=10, max_length=10000)
    analysis_type: str = Field(default="full", regex="^(full|quick|keywords_only)$")

class AnalysisResponse(BaseModel):
    score: int = Field(..., ge=0, le=100)
    suggestions: List[SuggestionModel]
    keyword_matches: List[str]
    missing_keywords: List[str]
    metadata: Dict[str, Any]

# Global analysis components
text_processor = TextProcessor()
keyword_analyzer = KeywordAnalyzer()
semantic_analyzer = SemanticAnalyzer()
structure_analyzer = StructureAnalyzer()
scoring_engine = ScoringEngine()
suggestion_generator = SuggestionGenerator()

@app.on_event("startup")
async def startup_event():
    """Initialize AI models on startup"""
    logger.info("Starting AI Analysis Service...")
    
    # Initialize models
    await semantic_analyzer.initialize()
    await keyword_analyzer.initialize()
    
    logger.info("AI models loaded successfully")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "service": "ai-analysis"
    }

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume(request: AnalysisRequest):
    """
    Analyze resume against job description using multi-stage AI pipeline
    """
    try:
        logger.info(f"Starting analysis for resume ({len(request.resume_text)} chars) against job description ({len(request.job_description)} chars)")
        
        # Stage 1: Text preprocessing
        processed_resume = await text_processor.process(request.resume_text)
        processed_job_desc = await text_processor.process(request.job_description)
        
        # Stage 2: Keyword analysis
        keyword_results = await keyword_analyzer.analyze(
            processed_resume, 
            processed_job_desc
        )
        
        # Stage 3: Semantic analysis (if full analysis)
        semantic_results = {}
        if request.analysis_type == "full":
            semantic_results = await semantic_analyzer.analyze(
                processed_resume, 
                processed_job_desc
            )
        
        # Stage 4: Structure analysis
        structure_results = await structure_analyzer.analyze(processed_resume)
        
        # Stage 5: Calculate final score
        score = scoring_engine.calculate_score(
            keyword_results=keyword_results,
            semantic_results=semantic_results,
            structure_results=structure_results,
            analysis_type=request.analysis_type
        )
        
        # Stage 6: Generate suggestions
        suggestions = suggestion_generator.generate_suggestions(
            keyword_results=keyword_results,
            semantic_results=semantic_results,
            structure_results=structure_results,
            score=score
        )
        
        # Prepare response
        response = AnalysisResponse(
            score=score,
            suggestions=suggestions,
            keyword_matches=keyword_results.get("matched_keywords", []),
            missing_keywords=keyword_results.get("missing_keywords", []),
            metadata={
                "analysis_type": request.analysis_type,
                "processing_time": datetime.utcnow().isoformat(),
                "keyword_score": keyword_results.get("score", 0),
                "semantic_score": semantic_results.get("score", 0) if semantic_results else 0,
                "structure_score": structure_results.get("score", 0)
            }
        )
        
        logger.info(f"Analysis completed with score: {score}")
        return response
        
    except Exception as e:
        logger.error(f"Error during analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/models/status")
async def get_models_status():
    """Get status of loaded AI models"""
    return {
        "semantic_analyzer": semantic_analyzer.is_loaded(),
        "keyword_analyzer": keyword_analyzer.is_loaded(),
        "text_processor": True,
        "structure_analyzer": True
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )