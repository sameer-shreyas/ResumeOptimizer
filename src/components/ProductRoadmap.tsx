import React, { useState } from 'react';
import { Calendar, CheckCircle, Clock, AlertTriangle, Star, Target, Zap, Users } from 'lucide-react';

const ProductRoadmap: React.FC = () => {
  const [selectedPhase, setSelectedPhase] = useState('mvp');

  const roadmapPhases = {
    mvp: {
      title: "MVP (Months 1-3)",
      status: "in-progress",
      color: "blue",
      timeline: "Q1 2025",
      features: [
        { name: "Basic Resume Upload & Analysis", priority: "high", status: "completed" },
        { name: "Keyword Matching Algorithm", priority: "high", status: "completed" },
        { name: "Simple ATS Scoring", priority: "high", status: "in-progress" },
        { name: "Basic Suggestion Engine", priority: "medium", status: "in-progress" },
        { name: "PDF Report Generation", priority: "medium", status: "planned" },
        { name: "User Authentication", priority: "high", status: "planned" }
      ]
    },
    v2: {
      title: "V2.0 (Months 4-8)",
      status: "planned",
      color: "green",
      timeline: "Q2-Q3 2025",
      features: [
        { name: "Advanced AI Analysis (BERT/Transformers)", priority: "high", status: "planned" },
        { name: "Interactive Suggestion Panels", priority: "high", status: "planned" },
        { name: "Version Comparison System", priority: "medium", status: "planned" },
        { name: "Real-time Preview", priority: "medium", status: "planned" },
        { name: "Industry-Specific Scoring", priority: "medium", status: "planned" },
        { name: "Mobile App (React Native)", priority: "low", status: "planned" }
      ]
    },
    enterprise: {
      title: "Enterprise (Months 9-12)",
      status: "future",
      color: "purple",
      timeline: "Q4 2025",
      features: [
        { name: "Multi-tenant Architecture", priority: "high", status: "planned" },
        { name: "Advanced Analytics Dashboard", priority: "high", status: "planned" },
        { name: "API for Third-party Integration", priority: "medium", status: "planned" },
        { name: "Custom Branding Options", priority: "medium", status: "planned" },
        { name: "Bulk Processing Capabilities", priority: "medium", status: "planned" },
        { name: "Advanced Security Features", priority: "high", status: "planned" }
      ]
    }
  };

  const riskAssessment = [
    {
      risk: "Model Bias",
      severity: "high",
      impact: "Unfair scoring for certain demographics",
      mitigation: "Diverse training data, bias testing, regular audits",
      probability: "medium"
    },
    {
      risk: "Performance Bottlenecks",
      severity: "medium", 
      impact: "Slow analysis times during peak usage",
      mitigation: "Auto-scaling, caching, queue management",
      probability: "high"
    },
    {
      risk: "Data Privacy Violations",
      severity: "high",
      impact: "GDPR fines, user trust loss",
      mitigation: "Data anonymization, encryption, compliance audits",
      probability: "low"
    },
    {
      risk: "AI Model Drift",
      severity: "medium",
      impact: "Declining accuracy over time",
      mitigation: "Continuous monitoring, model retraining, A/B testing",
      probability: "medium"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in-progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'planned': return <Target className="h-4 w-4 text-gray-400" />;
      default: return <Target className="h-4 w-4 text-gray-400" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-gray-900">Product Roadmap & Risk Assessment</h2>
        <p className="text-lg text-gray-600">Strategic development plan for scaling to 10K+ monthly active users</p>
      </div>

      {/* Phase Navigation */}
      <div className="flex flex-wrap justify-center gap-4">
        {Object.entries(roadmapPhases).map(([key, phase]) => (
          <button
            key={key}
            onClick={() => setSelectedPhase(key)}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-all ${
              selectedPhase === key
                ? `bg-${phase.color}-500 text-white shadow-lg`
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Calendar className="h-5 w-5" />
            <span>{phase.title}</span>
          </button>
        ))}
      </div>

      {/* Phase Details */}
      <div className="space-y-6">
        {Object.entries(roadmapPhases).map(([key, phase]) => (
          selectedPhase === key && (
            <div key={key} className={`bg-${phase.color}-50 rounded-xl p-6`}>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className={`text-2xl font-bold text-${phase.color}-900`}>{phase.title}</h3>
                  <p className={`text-${phase.color}-700`}>Timeline: {phase.timeline}</p>
                </div>
                <div className={`px-4 py-2 bg-${phase.color}-500 text-white rounded-lg font-medium`}>
                  {phase.status.charAt(0).toUpperCase() + phase.status.slice(1)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {phase.features.map((feature, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(feature.status)}
                        <span className="font-medium text-gray-900">{feature.name}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(feature.priority)}`}>
                        {feature.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
      </div>

      {/* Success Metrics */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Star className="h-6 w-6 mr-2" />
          Success Metrics & KPIs
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { metric: "Monthly Active Users", target: "10,000+", current: "250" },
            { metric: "Analysis Accuracy", target: "90%+", current: "78%" },
            { metric: "User Satisfaction", target: "4.5/5", current: "4.1/5" },
            { metric: "Revenue (MRR)", target: "$50,000", current: "$2,500" }
          ].map((item, index) => (
            <div key={index} className="bg-white p-4 rounded-lg border">
              <div className="text-sm text-gray-600">{item.metric}</div>
              <div className="text-lg font-bold text-gray-900">{item.target}</div>
              <div className="text-sm text-blue-600">Current: {item.current}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-gray-900 flex items-center">
          <AlertTriangle className="h-6 w-6 mr-2 text-red-500" />
          Risk Assessment & Mitigation
        </h3>
        <div className="space-y-4">
          {riskAssessment.map((risk, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{risk.risk}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      risk.severity === 'high' ? 'bg-red-100 text-red-800' :
                      risk.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {risk.severity} severity
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      risk.probability === 'high' ? 'bg-red-100 text-red-800' :
                      risk.probability === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {risk.probability} probability
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3">{risk.impact}</p>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800"><strong>Mitigation:</strong> {risk.mitigation}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Implementation Strategy */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Zap className="h-6 w-6 mr-2" />
          Implementation Strategy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Technical Approach</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Microservices architecture for scalability</li>
              <li>• Docker containerization for deployment</li>
              <li>• Redis caching for performance</li>
              <li>• Queue-based processing with Hangfire</li>
              <li>• Auto-scaling based on demand</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">AI/ML Strategy</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Start with rule-based keyword matching</li>
              <li>• Integrate sentence-transformers for semantic analysis</li>
              <li>• Implement continuous model training</li>
              <li>• A/B test different scoring algorithms</li>
              <li>• Monitor for bias and drift</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900">Go-to-Market</h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>• Freemium model with basic analysis</li>
              <li>• Premium features for advanced insights</li>
              <li>• Enterprise plans for bulk processing</li>
              <li>• Partner with career services</li>
              <li>• Content marketing and SEO</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductRoadmap;