using ResumeOptim.API.DTOs;

namespace ResumeOptim.API.Services;

public interface IAIAnalysisClient
{
    Task<AIAnalysisResponse> AnalyzeWithCerebras(AIAnalysisRequest request);
}