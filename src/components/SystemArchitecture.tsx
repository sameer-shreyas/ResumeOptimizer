import React from 'react';
import { Database, Cloud, Cpu, Shield, BarChart3, Users, Zap, GitBranch } from 'lucide-react';

const SystemArchitecture: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Enhanced System Architecture</h2>
        <p className="text-lg text-gray-600">Production-ready, scalable AI-powered resume analysis platform</p>
      </div>

      {/* Architecture Diagram */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Frontend Layer */}
          <div className="space-y-4">
            <div className="bg-blue-100 p-4 rounded-lg text-center">
              <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <h3 className="font-semibold text-blue-900">Frontend Layer</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                <strong>React SPA</strong>
                <ul className="mt-1 text-gray-600">
                  <li>• Interactive UI Components</li>
                  <li>• Real-time Progress</li>
                  <li>• Version Comparison</li>
                  <li>• Suggestion Panels</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-l-4 border-green-500">
                <strong>PWA Features</strong>
                <ul className="mt-1 text-gray-600">
                  <li>• Offline Capability</li>
                  <li>• Push Notifications</li>
                  <li>• Mobile Optimized</li>
                </ul>
              </div>
            </div>
          </div>

          {/* API Gateway */}
          <div className="space-y-4">
            <div className="bg-purple-100 p-4 rounded-lg text-center">
              <Shield className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <h3 className="font-semibold text-purple-900">API Gateway</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="bg-white p-3 rounded border-l-4 border-purple-500">
                <strong>ASP.NET Core</strong>
                <ul className="mt-1 text-gray-600">
                  <li>• Authentication/Authorization</li>
                  <li>• Rate Limiting</li>
                  <li>• Request Validation</li>
                  <li>• CORS Management</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-l-4 border-yellow-500">
                <strong>Security</strong>
                <ul className="mt-1 text-gray-600">
                  <li>• Data Anonymization</li>
                  <li>• GDPR Compliance</li>
                  <li>• Audit Logging</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Microservices */}
          <div className="space-y-4">
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <Cpu className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <h3 className="font-semibold text-green-900">Microservices</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="bg-white p-3 rounded border-l-4 border-green-500">
                <strong>File Processing</strong>
                <ul className="mt-1 text-gray-600">
                  <li>• PDF/DOCX Extraction</li>
                  <li>• Format Validation</li>
                  <li>• Text Preprocessing</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                <strong>AI Analysis Engine</strong>
                <ul className="mt-1 text-gray-600">
                  <li>• Multi-stage Scoring</li>
                  <li>• Semantic Analysis</li>
                  <li>• Industry Weighting</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-l-4 border-red-500">
                <strong>Report Generator</strong>
                <ul className="mt-1 text-gray-600">
                  <li>• PDF Generation</li>
                  <li>• Template Engine</li>
                  <li>• Version Tracking</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Infrastructure */}
          <div className="space-y-4">
            <div className="bg-orange-100 p-4 rounded-lg text-center">
              <Cloud className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <h3 className="font-semibold text-orange-900">Infrastructure</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="bg-white p-3 rounded border-l-4 border-orange-500">
                <strong>Storage</strong>
                <ul className="mt-1 text-gray-600">
                  <li>• Azure Blob Storage</li>
                  <li>• Redis Cache</li>
                  <li>• PostgreSQL</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-l-4 border-indigo-500">
                <strong>Processing</strong>
                <ul className="mt-1 text-gray-600">
                  <li>• Hangfire Queues</li>
                  <li>• Docker Containers</li>
                  <li>• Auto-scaling</li>
                </ul>
              </div>
              <div className="bg-white p-3 rounded border-l-4 border-pink-500">
                <strong>Monitoring</strong>
                <ul className="mt-1 text-gray-600">
                  <li>• Application Insights</li>
                  <li>• Health Checks</li>
                  <li>• Performance Metrics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Pipeline */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900 text-center">Multi-Stage AI Analysis Pipeline</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            {
              stage: "Stage 1",
              title: "Text Extraction & Preprocessing",
              description: "Extract text from PDF/DOCX, clean and normalize content",
              color: "blue",
              technologies: ["PdfPig", "python-docx", "spaCy NLP"]
            },
            {
              stage: "Stage 2", 
              title: "Keyword & Skills Analysis",
              description: "Hard matching of skills, tools, and technologies",
              color: "green",
              technologies: ["TF-IDF", "Named Entity Recognition", "Custom Dictionaries"]
            },
            {
              stage: "Stage 3",
              title: "Semantic Similarity",
              description: "Contextual understanding using transformer models",
              color: "purple",
              technologies: ["sentence-transformers", "BERT", "Cosine Similarity"]
            },
            {
              stage: "Stage 4",
              title: "Structural & Industry Analysis",
              description: "ATS formatting and industry-specific scoring",
              color: "orange",
              technologies: ["Format Detection", "Industry Models", "Weighted Scoring"]
            }
          ].map((stage, index) => (
            <div key={index} className={`bg-${stage.color}-50 border border-${stage.color}-200 rounded-lg p-4`}>
              <div className={`inline-block px-3 py-1 bg-${stage.color}-500 text-white text-sm font-medium rounded-full mb-3`}>
                {stage.stage}
              </div>
              <h4 className={`font-semibold text-${stage.color}-900 mb-2`}>{stage.title}</h4>
              <p className="text-gray-600 text-sm mb-3">{stage.description}</p>
              <div className="space-y-1">
                {stage.technologies.map((tech, techIndex) => (
                  <div key={techIndex} className={`text-xs bg-${stage.color}-100 text-${stage.color}-800 px-2 py-1 rounded`}>
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <BarChart3 className="h-6 w-6 mr-2" />
          Performance Targets
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { metric: "Analysis Time", target: "< 30 seconds", current: "45s" },
            { metric: "Accuracy", target: "> 85%", current: "78%" },
            { metric: "Throughput", target: "100 req/min", current: "60 req/min" },
            { metric: "Uptime", target: "99.9%", current: "99.2%" }
          ].map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600">{item.metric}</div>
              <div className="text-lg font-bold text-gray-900">{item.target}</div>
              <div className="text-sm text-gray-500">Current: {item.current}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SystemArchitecture;