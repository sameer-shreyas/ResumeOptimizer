using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace ResumeOptim.API.DTOs;

public class AnalysisRequestDto
{
    [Required]
    public IFormFile ResumeFile { get; set; } = null!;
    
    [Required]
    [StringLength(5000, MinimumLength = 50)]
    public string JobDescription { get; set; } = string.Empty;
    
    public string? SessionId { get; set; }
}

public class AnalysisResponseDto
{
    public Guid ReportId { get; set; }
    public int Score { get; set; }
    public List<SuggestionDto> Suggestions { get; set; } = new();
    public List<string> KeywordMatches { get; set; } = new();
    public List<string> MissingKeywords { get; set; } = new();
    public string FileName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class SuggestionDto
{
    public string Id { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string? Example { get; set; }
    public string Impact { get; set; } = string.Empty;
}

public class AIAnalysisRequest
{
    [JsonPropertyName("resume_text")]
    public string ResumeText { get; set; }

    [JsonPropertyName("job_description")]
    public string JobDescription { get; set; }

    [JsonPropertyName("analysis_type")]
    public string AnalysisType { get; set; }
}

public class AIAnalysisResponse
{
    public int Score { get; set; }
    public List<SuggestionDto> Suggestions { get; set; } = new();
    public List<string> KeywordMatches { get; set; } = new();
    public List<string> MissingKeywords { get; set; } = new();
    public Dictionary<string, object> Metadata { get; set; } = new();
}