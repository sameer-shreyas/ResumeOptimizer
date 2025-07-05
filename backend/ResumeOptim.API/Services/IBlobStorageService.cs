namespace ResumeOptim.API.Services;

public interface IBlobStorageService
{
    Task<string> UploadFileAsync(IFormFile file, string sessionId);
    Task<Stream> DownloadFileAsync(string blobPath);
    Task<bool> DeleteFileAsync(string blobPath);
}