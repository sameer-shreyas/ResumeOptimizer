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
            // Validate request
            var validationResult = await _validator.ValidateAsync(request);
            if (!validationResult.IsValid)
            {
                return BadRequest(validationResult.Errors);
            }

            // Validate file
            var fileValidation = await _fileProcessingService.ValidateFileAsync(request.ResumeFile);
            if (!fileValidation.IsValid)
            {
                return BadRequest(new { error = fileValidation.ErrorMessage });
            }

            // Generate session ID if not provided
            var sessionId = request.SessionId ?? Guid.NewGuid().ToString();

            // Queue background job for processing
            var jobId = BackgroundJob.Enqueue<IAnalysisService>(
                service => service.ProcessAnalysisAsync(request.ResumeFile, request.JobDescription, sessionId));

            _logger.LogInformation("Analysis job queued with ID: {JobId} for session: {SessionId}", jobId, sessionId);

            return Ok(new { jobId, sessionId, message = "Analysis started. Use the job ID to check status." });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing analysis request");
            return StatusCode(500, new { error = "Internal server error occurred" });
        }
    }

    [HttpGet("status/{jobId}")]
    public IActionResult GetJobStatus(string jobId)
    {
        try
        {
            var jobDetails = JobStorage.Current.GetConnection().GetJobData(jobId);
            
            if (jobDetails == null)
            {
                return NotFound(new { error = "Job not found" });
            }

            return Ok(new 
            { 
                jobId,
                state = jobDetails.State,
                createdAt = jobDetails.CreatedAt
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