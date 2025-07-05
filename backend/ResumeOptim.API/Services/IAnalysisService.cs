using ResumeOptim.API.DTOs;

namespace ResumeOptim.API.Services;

public interface IAnalysisService
{
    Task ProcessAnalysisAsync(IFormFile file, string jobDescription, string sessionId);
    Task<AnalysisResponseDto?> GetReportAsync(Guid reportId);
    Task<List<AnalysisResponseDto>> GetSessionReportsAsync(string sessionId);
}