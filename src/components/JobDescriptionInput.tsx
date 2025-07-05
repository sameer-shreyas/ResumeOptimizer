import React from 'react';
import { Briefcase } from 'lucide-react';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  value,
  onChange,
  placeholder = "Paste the job description here..."
}) => {
  const characterCount = value.length;
  const maxLength = 5000;
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Briefcase className="h-5 w-5 text-gray-600" />
        <label className="text-lg font-semibold text-gray-900">
          Job Description
        </label>
      </div>
      
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          rows={12}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none text-gray-700 placeholder-gray-500"
        />
        
        <div className="absolute bottom-3 right-3 flex items-center space-x-2">
          <span className={`text-sm ${characterCount > maxLength * 0.9 ? 'text-red-500' : 'text-gray-500'}`}>
            {characterCount.toLocaleString()}/{maxLength.toLocaleString()}
          </span>
        </div>
      </div>
      
      <div className="flex items-center space-x-4 text-sm text-gray-600">
        <span>• Include required skills and qualifications</span>
        <span>• Mention specific technologies and tools</span>
        <span>• Add years of experience requirements</span>
      </div>
    </div>
  );
};

export default JobDescriptionInput;