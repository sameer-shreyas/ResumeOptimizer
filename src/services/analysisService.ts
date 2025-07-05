import { apiClient, AnalysisReport } from './apiClient';

export interface AnalysisResult {
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
  reportId?: string;
  fileName?: string;
}

export interface AnalysisProgress {
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  message: string;
  progress: number;
}

export const analyzeResume = async (
  file: File,
  jobDescription: string,
  onProgress?: (progress: AnalysisProgress) => void
): Promise<AnalysisResult> => {
  try {
    // Get or create session ID
    const sessionId = getSessionId();

    // Step 1: Upload and start analysis
    onProgress?.({
      status: 'uploading',
      message: 'Uploading resume and starting analysis...',
      progress: 10
    });

    const uploadResponse = await apiClient.uploadAndAnalyze(file, jobDescription, sessionId);
    
    if (!uploadResponse.success || !uploadResponse.data) {
      throw new Error(uploadResponse.error || 'Upload failed');
    }

    const { jobId } = uploadResponse.data;

    // Step 2: Poll for job completion
    onProgress?.({
      status: 'processing',
      message: 'AI is analyzing your resume...',
      progress: 30
    });

    const result = await pollForCompletion(jobId, onProgress);
    
    // Step 3: Get the latest report for this session
    const reportsResponse = await apiClient.getSessionReports(sessionId);
    
    if (!reportsResponse.success || !reportsResponse.data || reportsResponse.data.length === 0) {
      throw new Error('No analysis report found');
    }

    // Get the most recent report
    const latestReport = reportsResponse.data[0];

    onProgress?.({
      status: 'completed',
      message: 'Analysis completed successfully!',
      progress: 100
    });

    return {
      score: latestReport.score,
      suggestions: latestReport.suggestions,
      keywordMatches: latestReport.keywordMatches,
      missingKeywords: latestReport.missingKeywords,
      reportId: latestReport.reportId,
      fileName: latestReport.fileName
    };

  } catch (error) {
    onProgress?.({
      status: 'failed',
      message: error instanceof Error ? error.message : 'Analysis failed',
      progress: 0
    });
    throw error;
  }
};

const pollForCompletion = async (
  jobId: string,
  onProgress?: (progress: AnalysisProgress) => void
): Promise<void> => {
  const maxAttempts = 60; // 5 minutes with 5-second intervals
  let attempts = 0;

  while (attempts < maxAttempts) {
    const statusResponse = await apiClient.getJobStatus(jobId);
    
    if (!statusResponse.success) {
      throw new Error(statusResponse.error || 'Failed to check job status');
    }

    const status = statusResponse.data?.state?.toLowerCase();
    
    switch (status) {
      case 'succeeded':
        return; // Job completed successfully
        
      case 'failed':
        throw new Error('Analysis job failed');
        
      case 'processing':
      case 'enqueued':
        const progress = Math.min(30 + (attempts * 2), 90);
        onProgress?.({
          status: 'processing',
          message: 'AI is analyzing your resume...',
          progress
        });
        break;
        
      default:
        // Continue polling for unknown states
        break;
    }

    attempts++;
    await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
  }

  throw new Error('Analysis timed out. Please try again.');
};

const getSessionId = (): string => {
  let sessionId = localStorage.getItem('resumeoptim_session_id');
  
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem('resumeoptim_session_id', sessionId);
  }
  
  return sessionId;
};

const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const getAnalysisHistory = async (): Promise<AnalysisReport[]> => {
  const sessionId = getSessionId();
  const response = await apiClient.getSessionReports(sessionId);
  
  if (!response.success) {
    throw new Error(response.error || 'Failed to fetch analysis history');
  }
  
  return response.data || [];
};

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await apiClient.checkHealth();
    return response.success;
  } catch {
    return false;
  }
};