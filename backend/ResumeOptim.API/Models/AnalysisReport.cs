using ResumeOptim.API.DTOs;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;

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

    public void SetSuggestions(List<SuggestionDto> suggestions)
    {
        Suggestions = JsonSerializer.Serialize(suggestions);
    }

    public List<SuggestionDto> GetSuggestions()
    {
        return JsonSerializer.Deserialize<List<SuggestionDto>>(Suggestions) ?? new List<SuggestionDto>();
    }

    public void SetKeywordMatches(List<string> keywords)
    {
        KeywordMatches = JsonSerializer.Serialize(keywords);
    }

    public List<string> GetKeywordMatches()
    {
        return JsonSerializer.Deserialize<List<string>>(KeywordMatches) ?? new List<string>();
    }

    public void SetMissingKeywords(List<string> keywords)
    {
        MissingKeywords = JsonSerializer.Serialize(keywords);
    }

    public List<string> GetMissingKeywords()
    {
        return JsonSerializer.Deserialize<List<string>>(MissingKeywords) ?? new List<string>();
    }
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

public class CerebrasOptions
{
    public const string Cerebras = "Cerebras";
    public string BaseUrl { get; set; } = string.Empty;
    public string ApiToken { get; set; } = string.Empty;
}