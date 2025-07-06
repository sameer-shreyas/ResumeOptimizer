using ResumeOptim.API.DTOs;

namespace ResumeOptim.API.Services;

public interface IAnalysisService
{
    Task ProcessAnalysisAsync(FileProcessingData fileData);
    Task<AnalysisResponseDto?> GetReportAsync(Guid reportId);
    Task<List<AnalysisResponseDto>> GetSessionReportsAsync(string sessionId);
}