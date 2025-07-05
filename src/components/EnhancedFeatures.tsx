import React, { useState } from 'react';
import { GitCompare, Lightbulb, Eye, Download, Star, TrendingUp, Users, Shield } from 'lucide-react';

const EnhancedFeatures: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState('comparison');

  const features = {
    comparison: {
      title: "Version Comparison",
      description: "Compare multiple resume versions side-by-side with detailed diff analysis",
      icon: GitCompare,
      color: "blue"
    },
    interactive: {
      title: "Interactive Suggestions",
      description: "Click-to-apply suggestions with real-time preview of improvements",
      icon: Lightbulb,
      color: "yellow"
    },
    preview: {
      title: "Real-time Preview",
      description: "See how your resume looks after implementing AI suggestions",
      icon: Eye,
      color: "green"
    },
    reports: {
      title: "Advanced Reports",
      description: "Generate detailed PDF reports with industry benchmarks",
      icon: Download,
      color: "purple"
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Enhanced User Experience Features</h2>
        <p className="text-lg text-gray-600">Next-generation features for professional resume optimization</p>
      </div>

      {/* Feature Navigation */}
      <div className="flex flex-wrap justify-center gap-4">
        {Object.entries(features).map(([key, feature]) => {
          const IconComponent = feature.icon;
          return (
            <button
              key={key}
              onClick={() => setActiveFeature(key)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
                activeFeature === key
                  ? `bg-${feature.color}-500 text-white shadow-lg`
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <IconComponent className="h-5 w-5" />
              <span>{feature.title}</span>
            </button>
          );
        })}
      </div>

      {/* Feature Details */}
      <div className="space-y-6">
        {activeFeature === 'comparison' && (
          <div className="space-y-6">
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Version Comparison System</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Resume V1.0 - Original</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>ATS Score:</span>
                      <span className="font-bold text-red-600">67/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Keywords Matched:</span>
                      <span className="text-gray-600">12/20</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Missing Skills:</span>
                      <span className="text-red-600">8</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Resume V2.0 - Optimized</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>ATS Score:</span>
                      <span className="font-bold text-green-600">89/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Keywords Matched:</span>
                      <span className="text-gray-600">18/20</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Missing Skills:</span>
                      <span className="text-green-600">2</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-green-100 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">Improvement: +22 points (+33%)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeFeature === 'interactive' && (
          <div className="space-y-6">
            <div className="bg-yellow-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-yellow-900 mb-4">Interactive Suggestion Panels</h3>
              <div className="space-y-4">
                {[
                  {
                    type: "Add Missing Skill",
                    suggestion: "Add 'React.js' to your skills section",
                    impact: "+5 points",
                    action: "Click to Add"
                  },
                  {
                    type: "Improve Description",
                    suggestion: "Quantify your achievement: 'Improved performance by 40%'",
                    impact: "+3 points", 
                    action: "Apply Change"
                  },
                  {
                    type: "Format Fix",
                    suggestion: "Use standard section header 'Professional Experience'",
                    impact: "+2 points",
                    action: "Auto-Fix"
                  }
                ].map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-yellow-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded">
                            {item.type}
                          </span>
                          <span className="text-green-600 font-medium text-sm">{item.impact}</span>
                        </div>
                        <p className="text-gray-700">{item.suggestion}</p>
                      </div>
                      <button className="ml-4 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors">
                        {item.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeFeature === 'preview' && (
          <div className="space-y-6">
            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-green-900 mb-4">Real-time Preview System</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4 border">
                  <h4 className="font-semibold text-gray-900 mb-3">Before Optimization</h4>
                  <div className="bg-gray-50 p-4 rounded text-sm font-mono">
                    <div className="space-y-2">
                      <div>John Doe</div>
                      <div>Software Developer</div>
                      <div className="mt-4">
                        <div className="font-semibold">Experience:</div>
                        <div>• Worked on web applications</div>
                        <div>• Used various technologies</div>
                        <div>• Improved system performance</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                  <h4 className="font-semibold text-gray-900 mb-3">After Optimization</h4>
                  <div className="bg-gray-50 p-4 rounded text-sm font-mono">
                    <div className="space-y-2">
                      <div>John Doe</div>
                      <div>Senior Full-Stack Developer</div>
                      <div className="mt-4">
                        <div className="font-semibold">Professional Experience:</div>
                        <div>• Developed 15+ React.js web applications</div>
                        <div>• Utilized Node.js, Python, and AWS technologies</div>
                        <div>• Improved system performance by 40%</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-green-600">
                    ✓ Added quantified metrics ✓ Included specific technologies ✓ Used standard headers
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeFeature === 'reports' && (
          <div className="space-y-6">
            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-purple-900 mb-4">Advanced Reporting System</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    title: "Executive Summary",
                    description: "High-level overview with key metrics and recommendations",
                    features: ["ATS Score Breakdown", "Industry Benchmarks", "Priority Actions"]
                  },
                  {
                    title: "Detailed Analysis",
                    description: "In-depth section-by-section analysis with examples",
                    features: ["Keyword Analysis", "Format Assessment", "Content Suggestions"]
                  },
                  {
                    title: "Action Plan",
                    description: "Step-by-step improvement roadmap with timelines",
                    features: ["Prioritized Tasks", "Implementation Guide", "Progress Tracking"]
                  }
                ].map((report, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-purple-200">
                    <h4 className="font-semibold text-gray-900 mb-2">{report.title}</h4>
                    <p className="text-gray-600 text-sm mb-3">{report.description}</p>
                    <ul className="space-y-1">
                      {report.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-xs text-purple-700 flex items-center">
                          <Star className="h-3 w-3 mr-1" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Security & Compliance */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Shield className="h-6 w-6 mr-2" />
          Security & Compliance Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: "Data Anonymization",
              description: "Auto-redact personal information before AI processing",
              icon: Users
            },
            {
              title: "GDPR Compliance",
              description: "Data retention policies and user consent management",
              icon: Shield
            },
            {
              title: "Audit Logging",
              description: "Complete audit trail of all data access and processing",
              icon: Eye
            },
            {
              title: "Rate Limiting",
              description: "Prevent API abuse with intelligent rate limiting",
              icon: TrendingUp
            }
          ].map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="bg-white p-4 rounded-lg border">
                <IconComponent className="h-8 w-8 text-blue-600 mb-2" />
                <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default EnhancedFeatures;