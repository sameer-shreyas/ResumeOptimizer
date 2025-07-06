using Microsoft.AspNetCore.Mvc;
using ResumeOptim.API.DTOs;
using ResumeOptim.API.Services;
using FluentValidation;
using Hangfire;

namespace ResumeOptim.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AnalysisController : ControllerBase
{
    private readonly IAnalysisService _analysisService;
    private readonly IFileProcessingService _fileProcessingService;
    private readonly IValidator<AnalysisRequestDto> _validator;
    private readonly ILogger<AnalysisController> _logger;

    public AnalysisController(
        IAnalysisService analysisService,
        IFileProcessingService fileProcessingService,
        IValidator<AnalysisRequestDto> validator,
        ILogger<AnalysisController> logger)
    {
        _analysisService = analysisService;
        _fileProcessingService = fileProcessingService;
        _validator = validator;
        _logger = logger;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> UploadAndAnalyze([FromForm] AnalysisRequestDto request)
    {
        try
        {
            // Validate request and file
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors);
            }

            var fileValidation = await _fileProcessingService.ValidateFileAsync(request.ResumeFile);
            if (!fileValidation.IsValid)
            {
                return BadRequest(new { error = fileValidation.ErrorMessage });
            }

            // Generate session ID if not provided
            var sessionId = request.SessionId ?? Guid.NewGuid().ToString();

            // Prepare file data for background processing
            var fileData = new FileProcessingData
            {
                FileName = request.ResumeFile.FileName,
                ContentType = request.ResumeFile.ContentType,
                Content = await GetFileBytes(request.ResumeFile),
                SessionId = sessionId,
                JobDescription = request.JobDescription
            };

            // Queue background job with serializable data
            var jobId = BackgroundJob.Enqueue<IAnalysisService>(
                service => service.ProcessAnalysisAsync(fileData));

            _logger.LogInformation("Analysis job queued with ID: {JobId} for session: {SessionId}",
                jobId, sessionId);

            return Ok(new { jobId, sessionId, message = "Analysis started. Use the job ID to check status." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing analysis request");
            return StatusCode(500, new { error = "Internal server error occurred" });
        }
    }

    private async Task<byte[]> GetFileBytes(IFormFile file)
    {
        using (var memoryStream = new MemoryStream())
        {
            await file.CopyToAsync(memoryStream);
            return memoryStream.ToArray();
        }
    }
    [HttpGet("status/{jobId}")]
    public IActionResult GetJobStatus(string jobId)
    {
        try
        {
            var jobData = JobStorage.Current.GetConnection().GetJobData(jobId);
            if (jobData == null)
            {
                return NotFound(new { error = "Job not found" });
            }

            // Map Hangfire states to client-expected values
            string state = jobData.State?.ToLower();
            string clientState = state switch
            {
                "succeeded" => "succeeded",
                "failed" => "failed",
                "deleted" => "failed",    // Terminal state
                "expired" => "failed",    // Terminal state
                "processing" => "processing",
                "enqueued" => "enqueued",
                _ => "processing"         // Default for other states
            };

            return Ok(new
            {
                jobId,
                state = clientState,
                createdAt = jobData.CreatedAt
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting job status for ID: {JobId}", jobId);
            return StatusCode(500, new { error = "Error retrieving job status" });
        }
    }
    [HttpGet("report/{reportId:guid}")]
    public async Task<IActionResult> GetReport(Guid reportId)
    {
        try
        {
            var report = await _analysisService.GetReportAsync(reportId);
            
            if (report == null)
            {
                return NotFound(new { error = "Report not found" });
            }

            return Ok(report);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving report: {ReportId}", reportId);
            return StatusCode(500, new { error = "Error retrieving report" });
        }
    }

    [HttpGet("session/{sessionId}/reports")]
    public async Task<IActionResult> GetSessionReports(string sessionId)
    {
        try
        {
            var reports = await _analysisService.GetSessionReportsAsync(sessionId);
            return Ok(reports);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving session reports for: {SessionId}", sessionId);
            return StatusCode(500, new { error = "Error retrieving session reports" });
        }
    }
}