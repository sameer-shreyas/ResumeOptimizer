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
        Act as a strict Applicant Tracking System (ATS) scanner. Analyze the resume against the job description using these criteria:
        1. **Hard Skills Match** (40% weight): Count exact matches of required technical skills/tools
        2. **Experience Relevance** (30% weight): Verify years of experience in required domains
        3. **Qualifications** (20% weight): Certifications/degrees matching requirements
        4. **Keyword Optimization** (10% weight): Resume keyword density and placement

        **Scoring Rules:**
        - Start at 50 points (minimum passing score)
        - Add points for matches (max +50)
        - Deduct points for missing requirements (max -50)
        - Round final score to nearest integer

        **Response Requirements:**
        - Return EXACTLY this JSON structure:
        {
            "Score": 0-100, 
            "Suggestions": [{
                "Type": "Critical|Moderate|Minor", 
                "Title": "Specific issue title", 
                "Description": "Actionable improvement", 
                "Example": "Concrete revision example",
                "Impact": "+X points if fixed"
            }],
            "KeywordMatches": ["exact matched terms"],
            "MissingKeywords": ["required terms absent from resume"]
        }

        **Strict Instructions:**
        1. Never suggest adding skills not mentioned in JD
        2. Flag resume padding attempts
        3. Prioritize suggestions by score impact
        4. Include only JD-specified keywords
        5. Treat similar terms as mismatches (e.g., "Azure" ? "AWS")
        """;
        var cerebrasRequest = new CerebrasRequest
        {
            Model = "llama-4-scout-17b-16e-instruct",
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

        response.EnsureSuccessStatusCode();

        var responseJson = await response.Content.ReadAsStringAsync();
        var cerebrasResponse = JsonSerializer.Deserialize<CerebrasResponse>(responseJson);

        var analysisJson = cerebrasResponse?.Choices.First().Message.Content;

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