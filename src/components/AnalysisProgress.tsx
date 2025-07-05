import React from 'react';
import { CheckCircle, AlertCircle, Loader2, Upload } from 'lucide-react';

interface AnalysisProgressProps {
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  message: string;
  progress: number;
}

const AnalysisProgress: React.FC<AnalysisProgressProps> = ({ status, message, progress }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
        return <Upload className="h-8 w-8 text-blue-600 animate-pulse" />;
      case 'processing':
        return <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="h-8 w-8 text-green-600" />;
      case 'failed':
        return <AlertCircle className="h-8 w-8 text-red-600" />;
      default:
        return <Loader2 className="h-8 w-8 text-gray-400" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'uploading':
      case 'processing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center space-y-6">
      <div className="flex justify-center">
        {getStatusIcon()}
      </div>
      
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900">
          {status === 'uploading' && 'Uploading Resume'}
          {status === 'processing' && 'Analyzing Resume'}
          {status === 'completed' && 'Analysis Complete'}
          {status === 'failed' && 'Analysis Failed'}
        </h3>
        
        <p className="text-gray-600">{message}</p>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-500 ${getStatusColor()}`}
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-500">{progress}% Complete</p>
      </div>
      
      {status === 'processing' && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            Our AI is analyzing your resume using advanced NLP models. This typically takes 30-60 seconds.
          </p>
        </div>
      )}
      
      {status === 'failed' && (
        <div className="bg-red-50 p-4 rounded-lg">
          <p className="text-sm text-red-800">
            Something went wrong during analysis. Please try again or contact support if the issue persists.
          </p>
        </div>
      )}
    </div>
  );
};

export default AnalysisProgress;