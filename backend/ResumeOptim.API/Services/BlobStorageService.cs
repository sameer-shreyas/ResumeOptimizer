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

    public BlobStorageService(IOptions<CloudflareR2Options> options, ILogger<BlobStorageService> logger)
    {
        _options = options.Value;
        _logger = logger;

        var config = new AmazonS3Config
        {
            ServiceURL = $"https://{_options.AccountId}.r2.cloudflarestorage.com",
            ForcePathStyle = true
        };

        _s3Client = new AmazonS3Client(_options.AccessKeyId, _options.SecretAccessKey, config);
    }

    public async Task<string> UploadFileAsync(IFormFile file, string sessionId)
    {
        try
        {
            var key = $"{sessionId}/{Guid.NewGuid()}_{file.FileName}";

            using var stream = file.OpenReadStream();
            var request = new PutObjectRequest
            {
                BucketName = _options.BucketName,
                Key = key,
                InputStream = stream,
                ContentType = file.ContentType,
                UseChunkedEncoding = false
            };

            await _s3Client.PutObjectAsync(request);
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
            var request = new GetObjectRequest
            {
                BucketName = _options.BucketName,
                Key = blobPath
            };

            var response = await _s3Client.GetObjectAsync(request);
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
            var request = new DeleteObjectRequest
            {
                BucketName = _options.BucketName,
                Key = blobPath
            };

            await _s3Client.DeleteObjectAsync(request);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file from R2: {BlobPath}", blobPath);
            return false;
        }
    }
}
