
namespace ResumeOptim.API.DTOs;
public class FileProcessingData
{
    public string FileName { get; set; }
    public string ContentType { get; set; }
    public byte[] Content { get; set; }
    public string SessionId { get; set; }
    public string JobDescription { get; set; }
}