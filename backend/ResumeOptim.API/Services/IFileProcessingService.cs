using ResumeOptim.API.DTOs;

namespace ResumeOptim.API.Services;

public interface IFileProcessingService
{
    Task<FileValidationResult> ValidateFileAsync(IFormFile file);
    Task<string> ExtractTextFromPdfAsync(Stream fileStream);
    Task<string> ExtractTextFromDocxAsync(Stream fileStream);
    Task<string> ProcessFileAsync(IFormFile file);
}

public class FileValidationResult
{
    public bool IsValid { get; set; }
    public string? ErrorMessage { get; set; }
}