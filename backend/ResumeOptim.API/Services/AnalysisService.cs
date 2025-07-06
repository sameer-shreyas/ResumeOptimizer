using Microsoft.EntityFrameworkCore;
using ResumeOptim.API.Data;
using ResumeOptim.API.DTOs;
using ResumeOptim.API.Models;
using System.Text.Json;

namespace ResumeOptim.API.Services;

public class AnalysisService : IAnalysisService
{
    private readonly ApplicationDbContext _context;
    private readonly IFileProcessingService _fileProcessingService;
    private readonly IBlobStorageService _blobStorageService;
    private readonly IAIAnalysisClient _aiAnalysisClient;
    private readonly ICacheService _cacheService;
    private readonly ILogger<AnalysisService> _logger;

    public AnalysisService(
        ApplicationDbContext context,
        IFileProcessingService fileProcessingService,
        IBlobStorageService blobStorageService,
        IAIAnalysisClient aiAnalysisClient,
        ICacheService cacheService,
        ILogger<AnalysisService> logger)
    {
        _context = context;
        _fileProcessingService = fileProcessingService;
        _blobStorageService = blobStorageService;
        _aiAnalysisClient = aiAnalysisClient;
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task ProcessAnalysisAsync(FileProcessingData fileData)
    {
        try
        {
            _logger.LogInformation("Starting analysis for session: {SessionId}", fileData.SessionId);

            // Create a stream from the byte array
            using var fileStream = new MemoryStream(fileData.Content);

            // Create a mock IFormFile if needed (or adapt your services to work with streams)
            var formFile = new FormFile(fileStream, 0, fileStream.Length,
                fileData.FileName, fileData.FileName)
            {
                Headers = new HeaderDictionary(),
                ContentType = fileData.ContentType
            };

            // 1. Upload file to blob storage (using either the stream or mock IFormFile)
            var blobPath = await _blobStorageService.UploadFileAsync(formFile, fileData.SessionId);

            // 2. Save file record to database
            var uploadedFile = new UploadedFile
            {
                Id = Guid.NewGuid(),
                FileName = formFile.FileName,
                BlobPath = blobPath,
                ContentType = formFile.ContentType,
                FileSize = formFile.Length,
                SessionId = fileData.SessionId
            };

            _context.UploadedFiles.Add(uploadedFile);
            await _context.SaveChangesAsync();

            // 3. Extract text from file
            var resumeText = await _fileProcessingService.ProcessFileAsync(formFile);

            // 4. Check cache for similar job descriptions
            var cacheKey = GenerateJobDescriptionCacheKey(fileData.JobDescription);
            var cachedKeywords = await _cacheService.GetAsync<List<string>>(cacheKey);

            // 5. Call AI analysis service
            var aiRequest = new AIAnalysisRequest
            {
                ResumeText = resumeText,
                JobDescription = fileData.JobDescription,
                AnalysisType = "full"
            };

            var aiResponse = await _aiAnalysisClient.AnalyzeAsync(aiRequest);

            // 6. Cache job description keywords if not cached
            if (cachedKeywords == null && aiResponse.KeywordMatches.Any())
            {
                await _cacheService.SetAsync(cacheKey, aiResponse.KeywordMatches, TimeSpan.FromHours(24));
            }

            // 7. Save analysis results to database
            var analysisReport = new AnalysisReport
            {
                Id = Guid.NewGuid(),
                Score = aiResponse.Score,
                Suggestions = JsonSerializer.Serialize(aiResponse.Suggestions),
                KeywordMatches = JsonSerializer.Serialize(aiResponse.KeywordMatches),
                MissingKeywords = JsonSerializer.Serialize(aiResponse.MissingKeywords),
                JobDescription = fileData.JobDescription,
                FileId = uploadedFile.Id
            };

            _context.AnalysisReports.Add(analysisReport);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Analysis completed for session: {SessionId}, Report ID: {ReportId}",
                fileData.SessionId, analysisReport.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing analysis for session: {SessionId}",
                fileData.SessionId);
            throw;
        }
    }
    public async Task<AnalysisResponseDto?> GetReportAsync(Guid reportId)
    {
        var report = await _context.AnalysisReports
            .Include(r => r.UploadedFile)
            .FirstOrDefaultAsync(r => r.Id == reportId);

        if (report == null)
        {
            return null;
        }

        return new AnalysisResponseDto
        {
            ReportId = report.Id,
            Score = report.Score,
            Suggestions = JsonSerializer.Deserialize<List<SuggestionDto>>(report.Suggestions) ?? new(),
            KeywordMatches = JsonSerializer.Deserialize<List<string>>(report.KeywordMatches) ?? new(),
            MissingKeywords = JsonSerializer.Deserialize<List<string>>(report.MissingKeywords) ?? new(),
            FileName = report.UploadedFile.FileName,
            CreatedAt = report.CreatedAt
        };
    }

    public async Task<List<AnalysisResponseDto>> GetSessionReportsAsync(string sessionId)
    {
        var reports = await _context.AnalysisReports
            .Include(r => r.UploadedFile)
            .Where(r => r.UploadedFile.SessionId == sessionId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return reports.Select(report => new AnalysisResponseDto
        {
            ReportId = report.Id,
            Score = report.Score,
            Suggestions = JsonSerializer.Deserialize<List<SuggestionDto>>(report.Suggestions) ?? new(),
            KeywordMatches = JsonSerializer.Deserialize<List<string>>(report.KeywordMatches) ?? new(),
            MissingKeywords = JsonSerializer.Deserialize<List<string>>(report.MissingKeywords) ?? new(),
            FileName = report.UploadedFile.FileName,
            CreatedAt = report.CreatedAt
        }).ToList();
    }

    private string GenerateJobDescriptionCacheKey(string jobDescription)
    {
        var hash = jobDescription.GetHashCode();
        return $"job_keywords_{Math.Abs(hash)}";
    }
}