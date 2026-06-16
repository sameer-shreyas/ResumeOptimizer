using FluentValidation;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.EntityFrameworkCore;
using ResumeOptim.API.Configuration;
using ResumeOptim.API.Data;
using ResumeOptim.API.Models;
using ResumeOptim.API.Services;
using Serilog;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Configure Serilog
Log.Logger = new LoggerConfiguration()
    .ReadFrom.Configuration(builder.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File("logs/resumeoptim-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// Get Render's dynamic PORT or default to 5000 locally
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";

// Render injects DATABASE_URL as postgres://user:pass@host:port/db — convert to Npgsql format
static string GetPostgresConnectionString(string fallback)
{
    var url = Environment.GetEnvironmentVariable("DATABASE_URL");
    if (url is null) return fallback;
    var uri = new Uri(url);
    var userInfo = uri.UserInfo.Split(':');
    var port = uri.Port > 0 ? uri.Port : 5432;
    return $"Host={uri.Host};Port={port};Database={uri.AbsolutePath.TrimStart('/')};Username={userInfo[0]};Password={Uri.UnescapeDataString(userInfo[1])};SSL Mode=Require;Trust Server Certificate=true";
}
builder.WebHost.ConfigureKestrel(options =>
{
    options.ListenAnyIP(Int32.Parse(port));
});

// Add services
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// EF Core
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(GetPostgresConnectionString(builder.Configuration.GetConnectionString("DefaultConnection")!)));

// Hangfire
builder.Services.AddHangfire(configuration => configuration
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UsePostgreSqlStorage(c => c.UseNpgsqlConnection(GetPostgresConnectionString(builder.Configuration.GetConnectionString("HangfireConnection")!))));

builder.Services.AddHangfireServer();

// Redis (optional, handle errors if not available)
builder.Services.AddStackExchangeRedisCache(options =>
{
    options.Configuration = builder.Configuration.GetConnectionString("Redis");
});

// Cloudflare R2 Storage
builder.Services.Configure<CloudflareR2Options>(
    builder.Configuration.GetSection("CloudflareR2"));

// Register services
builder.Services.AddScoped<IFileProcessingService, FileProcessingService>();
builder.Services.AddScoped<IAnalysisService, AnalysisService>();
builder.Services.AddScoped<IBlobStorageService, BlobStorageService>();
builder.Services.AddScoped<ICacheService, CacheService>();
builder.Services.AddScoped<IPdfService, PdfService>();

builder.Services.AddHttpClient<IAIAnalysisClient, AIAnalysisClient>(client =>
{
    client.Timeout = TimeSpan.FromMinutes(5);
});
builder.Services.Configure<CerebrasOptions>(
    builder.Configuration.GetSection(CerebrasOptions.Cerebras));

// FluentValidation
builder.Services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173", "https://resumeoptimizerats.netlify.app")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

var app = builder.Build();

// Enable Swagger always (you can conditionally hide it if needed)
app.UseSwagger();
app.UseSwaggerUI();

// Disable HTTPS redirection on Render (Render provides HTTPS)
if (!app.Environment.IsDevelopment())
{
    // Do NOT call `app.UseHttpsRedirection();`
}

app.UseCors("AllowReactApp");
app.UseAuthorization();

// Hangfire Dashboard
app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new HangfireAuthorizationFilter() }
});

app.MapControllers();

// Ensure DB is created
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    context.Database.EnsureCreated();
}

app.Run();
