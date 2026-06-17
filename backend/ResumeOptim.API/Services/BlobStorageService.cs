using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using ResumeOptim.API.Configuration;

namespace ResumeOptim.API.Services;

public class BlobStorageService : IBlobStorageService
{
    private readonly AmazonS3Client _s3Client;
    private readonly CloudflareR2Options _options;
    private readonly ILogger<BlobStorageService> _logger;
    private readonly HttpClient _httpClient;

    public BlobStorageService(IOptions<CloudflareR2Options> options, ILogger<BlobStorageService> logger, IHttpClientFactory httpClientFactory)
    {
        _options = options.Value;
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient();

        var config = new AmazonS3Config
        {
            ServiceURL = $"https://{_options.AccountId}.r2.cloudflarestorage.com",
            ForcePathStyle = true,
            AuthenticationRegion = "auto"
        };

        _s3Client = new AmazonS3Client(_options.AccessKeyId, _options.SecretAccessKey, config);
    }

    public async Task<string> UploadFileAsync(IFormFile file, string sessionId)
    {
        try
        {
            var key = $"{sessionId}/{Guid.NewGuid()}_{file.FileName}";

            var presignedUrl = _s3Client.GetPreSignedURL(new GetPreSignedUrlRequest
            {
                BucketName = _options.BucketName,
                Key = key,
                Verb = HttpVerb.PUT,
                Expires = DateTime.UtcNow.AddMinutes(5)
            });

            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);

            using var content = new ByteArrayContent(ms.ToArray());
            var response = await _httpClient.PutAsync(presignedUrl, content);
            response.EnsureSuccessStatusCode();

            _logger.LogInformation("File uploaded to R2: {Key}", key);
            return key;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file to R2");
            throw;
        }
    }

    public async Task<Stream> DownloadFileAsync(string blobPath)
    {
        try
        {
            var response = await _s3Client.GetObjectAsync(new GetObjectRequest
            {
                BucketName = _options.BucketName,
                Key = blobPath
            });
            return response.ResponseStream;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error downloading file from R2: {BlobPath}", blobPath);
            throw;
        }
    }

    public async Task<bool> DeleteFileAsync(string blobPath)
    {
        try
        {
            await _s3Client.DeleteObjectAsync(new DeleteObjectRequest
            {
                BucketName = _options.BucketName,
                Key = blobPath
            });
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file from R2: {BlobPath}", blobPath);
            return false;
        }
    }
}
