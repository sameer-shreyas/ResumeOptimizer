using UglyToad.PdfPig;
using UglyToad.PdfPig.Content;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using System.Text;

namespace ResumeOptim.API.Services;

public class FileProcessingService : IFileProcessingService
{
    private readonly ILogger<FileProcessingService> _logger;
    private readonly string[] _allowedExtensions = { ".pdf", ".docx" };
    private readonly string[] _allowedContentTypes = { "application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document" };
    private const long MaxFileSize = 5 * 1024 * 1024; // 5MB

    public FileProcessingService(ILogger<FileProcessingService> logger)
    {
        _logger = logger;
    }

    public async Task<FileValidationResult> ValidateFileAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return new FileValidationResult { IsValid = false, ErrorMessage = "No file provided" };
        }

        if (file.Length > MaxFileSize)
        {
            return new FileValidationResult { IsValid = false, ErrorMessage = "File size exceeds 5MB limit" };
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_allowedExtensions.Contains(extension))
        {
            return new FileValidationResult { IsValid = false, ErrorMessage = "Only PDF and DOCX files are allowed" };
        }

        if (!_allowedContentTypes.Contains(file.ContentType))
        {
            return new FileValidationResult { IsValid = false, ErrorMessage = "Invalid file type" };
        }

        return new FileValidationResult { IsValid = true };
    }

    public async Task<string> ProcessFileAsync(IFormFile file)
    {
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        
        using var stream = file.OpenReadStream();
        
        return extension switch
        {
            ".pdf" => await ExtractTextFromPdfAsync(stream),
            ".docx" => await ExtractTextFromDocxAsync(stream),
            _ => throw new NotSupportedException($"File type {extension} is not supported")
        };
    }

    public async Task<string> ExtractTextFromPdfAsync(Stream fileStream)
    {
        try
        {
            using var document = PdfDocument.Open(fileStream);
            var text = new StringBuilder();

            foreach (Page page in document.GetPages())
            {
                var pageText = page.Text;
                text.AppendLine(pageText);
            }

            return text.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting text from PDF");
            throw new InvalidOperationException("Failed to extract text from PDF file", ex);
        }
    }

    public async Task<string> ExtractTextFromDocxAsync(Stream fileStream)
    {
        try
        {
            using var document = WordprocessingDocument.Open(fileStream, false);
            var body = document.MainDocumentPart?.Document?.Body;
            
            if (body == null)
            {
                return string.Empty;
            }

            var text = new StringBuilder();
            
            foreach (var paragraph in body.Elements<Paragraph>())
            {
                text.AppendLine(paragraph.InnerText);
            }

            return text.ToString();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting text from DOCX");
            throw new InvalidOperationException("Failed to extract text from DOCX file", ex);
        }
    }
}