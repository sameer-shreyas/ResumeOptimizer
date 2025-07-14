using ResumeOptim.API.Models;
using System.Threading.Tasks;

namespace ResumeOptim.API.Services
{
    public interface IPdfService
    {
        byte[] GenerateReportPdf(AnalysisReport report);
    }
}