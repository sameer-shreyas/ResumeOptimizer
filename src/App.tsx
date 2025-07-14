import React, { useState } from 'react';
import Header from './components/Header';
import FileUpload from './components/FileUpload';
import JobDescriptionInput from './components/JobDescriptionInput';
import AnalysisResults from './components/AnalysisResults';
import AnalysisProgress from './components/AnalysisProgress';
import BackendStatus from './components/BackendStatus';
import EnhancedApp from './components/EnhancedApp';
import { analyzeResume, AnalysisResult, AnalysisProgress as AnalysisProgressType, downloadReportPdf } from './services/analysisService';
import { Play, Sparkles, CheckCircle, Settings } from 'lucide-react';

function App() {
  const [viewMode, setViewMode] = useState<'demo' | 'enhancement'>('demo');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState<AnalysisProgressType | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (file: File) => {
    setUploadedFile(file);
    setAnalysisResult(null);
    setShowResults(false);
    setError(null);
    setAnalysisProgress(null);
  };

  const handleAnalyze = async () => {
    if (!uploadedFile || !jobDescription.trim()) {
      setError('Please upload a resume and enter a job description');
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysisProgress(null);
    
    try {
      const result = await analyzeResume(
        uploadedFile, 
        jobDescription,
        (progress) => setAnalysisProgress(progress)
      );
      
      setAnalysisResult(result);
      setShowResults(true);
    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error instanceof Error ? error.message : 'Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(null);
    }
  };

    const handleSaveReport = async () => {
        if (!analysisResult?.reportId) {
            alert('No report available to save');
            return;
        }

        try {
            setIsAnalyzing(true);
            const pdfBlob = await downloadReportPdf(analysisResult.reportId);

            const filename = `ResumeAnalysis_${analysisResult.fileName?.replace(/\.[^/.]+$/, "") || "report"
                }_${new Date().toISOString().slice(0, 10)}.pdf`;

            // Trigger download
            const url = window.URL.createObjectURL(pdfBlob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to save report:', error);
            setError('Failed to download PDF. Please try again.');
        } finally {
            setIsAnalyzing(false);
        }
    };

  const handleRetry = () => {
    setError(null);
    setAnalysisProgress(null);
    setShowResults(false);
  };

  const canAnalyze = uploadedFile && jobDescription.trim() && !isAnalyzing;

  if (viewMode === 'enhancement') {
    return <EnhancedApp />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* View Mode Toggle */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <BackendStatus />
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setViewMode('demo')}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                viewMode === 'demo'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Production Demo
            </button>
            <button
              onClick={() => setViewMode('enhancement')}
              className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                viewMode === 'enhancement'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Settings className="h-4 w-4 inline mr-1" />
              Enhancement Plan
            </button>
          </div>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Display */}
        {error && (
          <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-800 font-medium">Analysis Error</span>
              </div>
              <button
                onClick={handleRetry}
                className="text-red-600 hover:text-red-800 font-medium"
              >
                Try Again
              </button>
            </div>
            <p className="text-red-700 mt-2">{error}</p>
          </div>
        )}

        {/* Analysis Progress */}
        {isAnalyzing && analysisProgress && (
          <div className="mb-8">
            <AnalysisProgress
              status={analysisProgress.status}
              message={analysisProgress.message}
              progress={analysisProgress.progress}
            />
          </div>
        )}

        {!showResults && !isAnalyzing ? (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Sparkles className="h-8 w-8 text-blue-600" />
                <h1 className="text-3xl font-bold text-gray-900">
                  AI-Powered Resume Analysis
                </h1>
              </div>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Upload your resume and job description to get an instant ATS compatibility score 
                with actionable suggestions powered by advanced AI models.
              </p>
            </div>

            {/* Upload and Input Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* File Upload */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Upload Your Resume
                  </h2>
                  <FileUpload
                    onFileUpload={handleFileUpload}
                    uploadedFile={uploadedFile}
                    isProcessing={isAnalyzing}
                  />
                </div>
              </div>

              {/* Job Description Input */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <JobDescriptionInput
                    value={jobDescription}
                    onChange={setJobDescription}
                  />
                </div>
              </div>
            </div>

            {/* Analysis Button */}
            <div className="text-center">
              <button
                onClick={handleAnalyze}
                disabled={!canAnalyze}
                className={`inline-flex items-center space-x-3 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 ${
                  canAnalyze
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Play className="h-5 w-5" />
                <span>Analyze with AI</span>
              </button>
            </div>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              {[
                {
                  icon: <CheckCircle className="h-8 w-8 text-green-600" />,
                  title: 'Real ATS Scoring',
                  description: 'Advanced AI models analyze your resume against actual ATS requirements and job descriptions.'
                },
                {
                  icon: <Sparkles className="h-8 w-8 text-blue-600" />,
                  title: 'Multi-Stage Analysis',
                  description: 'Keyword matching, semantic analysis, and structure evaluation for comprehensive insights.'
                },
                {
                  icon: <Play className="h-8 w-8 text-purple-600" />,
                  title: 'Production Ready',
                  description: 'Built with enterprise-grade infrastructure including background processing and caching.'
                }
              ].map((feature, index) => (
                <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
                  <div className="flex justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : showResults && analysisResult ? (
          <div className="space-y-8">
            {/* Back Button */}
            <button
              onClick={() => setShowResults(false)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              <span>← Back to Upload</span>
            </button>

            {/* Results */}
            <AnalysisResults
              score={analysisResult.score}
              suggestions={analysisResult.suggestions}
              keywordMatches={analysisResult.keywordMatches}
              missingKeywords={analysisResult.missingKeywords}
              fileName={analysisResult.fileName || uploadedFile?.name || 'resume.pdf'}
                onSaveReport={handleSaveReport}
                isSaving={isAnalyzing}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}

export default App;