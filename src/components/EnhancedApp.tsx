import React, { useState } from 'react';
import { Brain, BarChart3, Map, Shield } from 'lucide-react';
import SystemArchitecture from './SystemArchitecture';
import EnhancedFeatures from './EnhancedFeatures';
import ProductRoadmap from './ProductRoadmap';

const EnhancedApp: React.FC = () => {
  const [activeSection, setActiveSection] = useState('architecture');

  const sections = {
    architecture: {
      title: "System Architecture",
      description: "Production-ready, scalable system design",
      icon: Brain,
      component: SystemArchitecture
    },
    features: {
      title: "Enhanced Features",
      description: "Next-generation user experience improvements",
      icon: BarChart3,
      component: EnhancedFeatures
    },
    roadmap: {
      title: "Product Roadmap",
      description: "Strategic development plan and risk assessment",
      icon: Map,
      component: ProductRoadmap
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    ResumeOptim<span className="text-blue-600">.AI</span>
                  </h1>
                  <p className="text-xs text-gray-600">Production Enhancement Plan</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Enterprise Ready</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {Object.entries(sections).map(([key, section]) => {
              const IconComponent = section.icon;
              return (
                <button
                  key={key}
                  onClick={() => setActiveSection(key)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeSection === key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <IconComponent className="h-4 w-4" />
                  <span>{section.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Section Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-2">
              {React.createElement(sections[activeSection as keyof typeof sections].icon, {
                className: "h-8 w-8 text-blue-600"
              })}
              <h1 className="text-3xl font-bold text-gray-900">
                {sections[activeSection as keyof typeof sections].title}
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {sections[activeSection as keyof typeof sections].description}
            </p>
          </div>

          {/* Dynamic Content */}
          <div>
            {React.createElement(sections[activeSection as keyof typeof sections].component)}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>ResumeOptim.AI Enhancement Plan - Designed for 10K+ Monthly Active Users</p>
            <p className="text-sm mt-2">Built with React, TypeScript, and Tailwind CSS</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default EnhancedApp;