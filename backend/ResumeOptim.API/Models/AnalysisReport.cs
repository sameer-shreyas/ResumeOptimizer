using System.ComponentModel.DataAnnotations;

namespace ResumeOptim.API.Models;

public class AnalysisReport
{
    public Guid Id { get; set; }
    
    [Range(0, 100)]
    public int Score { get; set; }
    
    public string Suggestions { get; set; } = string.Empty;
    public string KeywordMatches { get; set; } = string.Empty;
    public string MissingKeywords { get; set; } = string.Empty;
    public string JobDescription { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    
    // Navigation properties
    public Guid FileId { get; set; }
    public UploadedFile UploadedFile { get; set; } = null!;
}

public class UploadedFile
{
    public Guid Id { get; set; }
    public string FileName { get; set; } = string.Empty;
    public string BlobPath { get; set; } = string.Empty;
    public string ContentType { get; set; } = string.Empty;
    public long FileSize { get; set; }
    public DateTime UploadedAt { get; set; }
    public string SessionId { get; set; } = string.Empty;
    
    // Navigation properties
    public ICollection<AnalysisReport> AnalysisReports { get; set; } = new List<AnalysisReport>();
}

public class UserSession
{
    public Guid Id { get; set; }
    public string SessionId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? LastActivity { get; set; }
}