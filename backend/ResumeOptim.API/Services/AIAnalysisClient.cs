using Microsoft.Extensions.Options;
using ResumeOptim.API.DTOs;
using ResumeOptim.API.Models;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace ResumeOptim.API.Services;

public class AIAnalysisClient : IAIAnalysisClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AIAnalysisClient> _logger;
    private readonly CerebrasOptions _options;

    public AIAnalysisClient(HttpClient httpClient, ILogger<AIAnalysisClient> logger,
        IOptions<CerebrasOptions> options)
    {
        _httpClient = httpClient;
        _logger = logger;
        _options = options.Value;
    }

    public async Task<AIAnalysisResponse> AnalyzeWithCerebras(AIAnalysisRequest request)
    {
        const string SYSTEM_PROMPT = """
        Act as a fair but rigorous Applicant Tracking System (ATS) scanner. Analyze the resume against the job description using these criteria:
        1. **Hard Skills Match** (40% weight): Required technical skills/tools present in the resume
        2. **Experience Relevance** (30% weight): Years of experience in required domains
        3. **Qualifications** (20% weight): Certifications/degrees matching requirements
        4. **Keyword Optimization** (10% weight): Resume keyword density and placement

        **Scoring Rules:**
        - Start at 50 points (baseline)
        - Add points for matches (max +50)
        - Deduct points for missing requirements (max -50)
        - Round final score to nearest integer

        **Keyword Matching Rules:**
        - Treat semantic equivalents as MATCHES, not mismatches. Examples:
            - "Postgres" = "PostgreSQL" = "psql"
            - "React" = "React.js" = "ReactJS"
            - "JS" = "JavaScript", "TS" = "TypeScript"
            - "k8s" = "Kubernetes", "GCP" = "Google Cloud"
            - "ML" = "Machine Learning", "NLP" = "Natural Language Processing"
            - "REST API" = "RESTful API" = "REST"
            - Common abbreviations, version variants, and casing differences ALL count as matches
        - Only treat as a mismatch when the underlying technology is genuinely different (e.g., "Azure" vs "AWS", "MySQL" vs "PostgreSQL", "Angular" vs "React")
        - Give partial credit when a candidate has a closely related skill (e.g., JD wants "TensorFlow", resume has "PyTorch" - count as 50% match, not zero)

        **Reasoning Process:**
        Before producing JSON, internally identify:
        1. All required skills/keywords from the JD
        2. Which ones are present in the resume (accounting for synonyms above)
        3. Which ones are genuinely missing
        4. The candidate's experience level vs JD requirement
        Then compute the score.

        **Response Requirements:**
        - Return EXACTLY this JSON structure (no markdown, no commentary):
        {
            "Score": 0-100,
            "Suggestions": [{
                "Type": "Critical|Moderate|Minor",
                "Title": "Specific issue title",
                "Description": "Actionable improvement",
                "Example": "Concrete revision example",
                "Impact": "+X points if fixed"
            }],
            "KeywordMatches": ["exact matched terms from JD that appear (directly or as equivalents) in resume"],
            "MissingKeywords": ["JD-required terms genuinely absent from resume"]
        }

        **Strict Instructions:**
        1. Never suggest adding skills not mentioned in the JD
        2. Flag resume padding attempts
        3. Prioritize suggestions by score impact (highest first)
        4. Include only JD-specified keywords in the match/missing lists
        """;
        var cerebrasRequest = new CerebrasRequest
        {
            Model = "gpt-oss-120b",
            Temperature = 0.1f,
            Messages = new List<ChatMessage>
        {
            new() { Role = "system", Content = SYSTEM_PROMPT },
            new()
            {
                Role = "user",
                Content = $"RESUME: {request.ResumeText}\n\nJD: {request.JobDescription}"
            }
        },
            Format = new ResponseFormat { Type = "json_object" }
        };

        var json = JsonSerializer.Serialize(cerebrasRequest);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Use configured values
        var httpRequest = new HttpRequestMessage(HttpMethod.Post, _options.BaseUrl);
        httpRequest.Headers.Authorization =
            new AuthenticationHeaderValue("Bearer", _options.ApiToken);
        httpRequest.Content = content;

        var response = await _httpClient.SendAsync(httpRequest);

        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            _logger.LogError("Cerebras API error {Status}: {Body}", (int)response.StatusCode, errorBody);
            response.EnsureSuccessStatusCode();
        }

        var responseJson = await response.Content.ReadAsStringAsync();
        var cerebrasResponse = JsonSerializer.Deserialize<CerebrasResponse>(responseJson);

        var analysisJson = cerebrasResponse?.Choices[0].Message.Content;

        try
        {
            return JsonSerializer.Deserialize<AIAnalysisResponse>(analysisJson);
        }
        catch (JsonException)
        {
            var results = JsonSerializer.Deserialize<List<AIAnalysisResponse>>(analysisJson);
            return results?.FirstOrDefault()
                ?? throw new InvalidOperationException("Invalid response format from AI");
        }
    }
}