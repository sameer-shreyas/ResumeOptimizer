using Hangfire.Dashboard;

namespace ResumeOptim.API.Configuration;

public class HangfireAuthorizationFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context)
    {
        // In production, implement proper authorization
        // For now, allow access in development environment
        return true;
    }
}