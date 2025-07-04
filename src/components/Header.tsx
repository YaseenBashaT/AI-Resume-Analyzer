import React from 'react';
import { Brain, Zap, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-gradient-to-r from-green-500 to-blue-600 p-4 rounded-2xl shadow-lg">
          <Brain className="w-8 h-8 text-white" />
        </div>
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
        AI Resume Analyzer
      </h1>
      
      <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
        Get lightning-fast, intelligent insights and actionable feedback on your resume using advanced AI models.
        Upload your resume and discover how to make it stand out to employers.
      </p>
      
      <div className="flex items-center justify-center mt-6 space-x-2 text-sm text-slate-500">
        <Zap className="w-4 h-4 text-green-500" />
        <span>Lightning Fast AI Analysis</span>
      </div>
      
      <div className="mt-4 inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 rounded-full text-sm font-medium">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
        Enhanced with AI for Superior Analysis
        <Sparkles className="w-4 h-4 ml-2 text-blue-600" />
      </div>
    </div>
  );
};