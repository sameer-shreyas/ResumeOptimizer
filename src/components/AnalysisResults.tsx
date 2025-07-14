import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle, XCircle, Download, FileText, Target, Zap, Loader } from 'lucide-react';
import CircularProgress from './CircularProgress';

interface Suggestion {
  id: string;
  type: 'critical' | 'warning' | 'improvement';
  title: string;
  description: string;
  example?: string;
  impact: 'high' | 'medium' | 'low';
}

interface AnalysisResultsProps {
  score: number;
  suggestions: Suggestion[];
  keywordMatches: string[];
  missingKeywords: string[];
    fileName: string;
    isSaving?: boolean;
  onSaveReport: () => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  score,
  suggestions,
  keywordMatches,
  missingKeywords,
    fileName,
    isSaving,
  onSaveReport
}) => {
  const [expandedSuggestions, setExpandedSuggestions] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'keywords' | 'suggestions'>('overview');

  const toggleSuggestion = (id: string) => {
    setExpandedSuggestions(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'critical': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'improvement': return <CheckCircle className="h-5 w-5 text-blue-500" />;
      default: return <CheckCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <FileText className="h-6 w-6 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Analysis Results</h2>
        </div>
              <button
                  onClick={onSaveReport}
                  disabled={isSaving}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-400"
              >
                  {isSaving ? (
                      <span className="flex items-center">
                          <Loader className="h-4 w-4 mr-2 animate-spin" />
                          Generating PDF...
                      </span>
                  ) : (
                      'Save Report as PDF'
                  )}
              </button>
      </div>

      {/* Score Overview */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">ATS Compatibility Score</h3>
          <p className="text-gray-600">Resume: {fileName}</p>
          <div className="flex items-center space-x-2">
            <span className={`text-3xl font-bold ${getScoreColor(score)}`}>{score}/100</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              score >= 80 ? 'bg-green-100 text-green-800' :
              score >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {getScoreLabel(score)}
            </span>
          </div>
        </div>
        <CircularProgress percentage={score} />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'keywords', label: 'Keywords', icon: FileText },
            { id: 'suggestions', label: 'Suggestions', icon: Zap }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Matched Keywords</span>
              </div>
              <p className="text-2xl font-bold text-green-600">{keywordMatches.length}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-800">Missing Keywords</span>
              </div>
              <p className="text-2xl font-bold text-red-600">{missingKeywords.length}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-800">Suggestions</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">{suggestions.length}</p>
            </div>
          </div>
        )}

        {activeTab === 'keywords' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Matched Keywords ({keywordMatches.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {keywordMatches.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                <XCircle className="h-4 w-4 mr-2" />
                Missing Keywords ({missingKeywords.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {missingKeywords.map((keyword, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <div
                  className="p-4 cursor-pointer"
                  onClick={() => toggleSuggestion(suggestion.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getSuggestionIcon(suggestion.type)}
                      <div>
                        <h4 className="font-semibold text-gray-900">{suggestion.title}</h4>
                        <p className="text-sm text-gray-600">{suggestion.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        suggestion.impact === 'high' ? 'bg-red-100 text-red-800' :
                        suggestion.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {suggestion.impact} impact
                      </span>
                      {expandedSuggestions.includes(suggestion.id) ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                  </div>
                </div>
                
                {expandedSuggestions.includes(suggestion.id) && suggestion.example && (
                  <div className="px-4 pb-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-700 font-medium mb-2">Example:</p>
                      <p className="text-sm text-gray-600">{suggestion.example}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisResults;