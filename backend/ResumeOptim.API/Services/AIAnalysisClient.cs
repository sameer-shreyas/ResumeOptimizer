using ResumeOptim.API.DTOs;
using System.Text;
using System.Text.Json;

namespace ResumeOptim.API.Services;

public class AIAnalysisClient : IAIAnalysisClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<AIAnalysisClient> _logger;

    public AIAnalysisClient(HttpClient httpClient, ILogger<AIAnalysisClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<AIAnalysisResponse> AnalyzeAsync(AIAnalysisRequest request)
    {
        try
        {
            var json = JsonSerializer.Serialize(request, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            var content = new StringContent(json, Encoding.UTF8, "application/json");
            
            _logger.LogInformation("Sending analysis request to AI service");
            
            var response = await _httpClient.PostAsync("/analyze", content);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("AI service returned error: {StatusCode} - {Content}", 
                    response.StatusCode, errorContent);
                throw new HttpRequestException($"AI service error: {response.StatusCode}");
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<AIAnalysisResponse>(responseJson, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            return result ?? throw new InvalidOperationException("Invalid response from AI service");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling AI analysis service");
            throw;
        }
    }
}