// API client for backend communication
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://resumeoptimizer-yvnv.onrender.com';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface UploadResponse {
  jobId: string;
  sessionId: string;
  message: string;
}

export interface JobStatus {
  jobId: string;
  state: string;
  createdAt: string;
}

export interface AnalysisReport {
  reportId: string;
  score: number;
  suggestions: Array<{
    id: string;
    type: 'critical' | 'warning' | 'improvement';
    title: string;
    description: string;
    example?: string;
    impact: 'high' | 'medium' | 'low';
  }>;
  keywordMatches: string[];
  missingKeywords: string[];
  fileName: string;
  createdAt: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    console.log('API Client initialized with base URL:', this.baseUrl);
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      console.log('Making API request to:', url);
      
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API request failed:', response.status, errorText);
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async uploadAndAnalyze(
    file: File,
    jobDescription: string,
    sessionId?: string
  ): Promise<ApiResponse<UploadResponse>> {
    const formData = new FormData();
    formData.append('resumeFile', file);
    formData.append('jobDescription', jobDescription);
    if (sessionId) {
      formData.append('sessionId', sessionId);
    }

    try {
      const url = `${this.baseUrl}/api/analysis/upload`;
      console.log('Uploading to:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed:', response.status, errorText);
        return {
          success: false,
          error: `Upload failed: ${errorText}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  async getJobStatus(jobId: string): Promise<ApiResponse<JobStatus>> {
    return this.makeRequest<JobStatus>(`/api/analysis/status/${jobId}`);
  }

  async getReport(reportId: string): Promise<ApiResponse<AnalysisReport>> {
    return this.makeRequest<AnalysisReport>(`/api/analysis/report/${reportId}`);
  }

  async getSessionReports(sessionId: string): Promise<ApiResponse<AnalysisReport[]>> {
    return this.makeRequest<AnalysisReport[]>(`/api/analysis/session/${sessionId}/reports`);
  }

  async checkHealth(): Promise<ApiResponse<{ status: string }>> {
    return this.makeRequest<{ status: string }>('/health');
  }
}

export const apiClient = new ApiClient();