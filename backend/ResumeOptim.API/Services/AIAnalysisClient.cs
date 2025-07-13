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
        Return EXACTLY this JSON structure (single object, no wrapping array):
        {
            "Score": 0-100,
            "Suggestions": [{
                "Type": "...", 
                "Title": "...", 
                "Description": "...", 
                "Example": "...", 
                "Impact": "..."
            }],
            "KeywordMatches": ["...", "..."],
            "MissingKeywords": ["...", "..."]
        }
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