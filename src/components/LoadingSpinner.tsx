import React from 'react';
import { Brain, Loader2, Zap } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12">
      <div className="text-center space-y-6">
        <div className="relative inline-block">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-blue-600 rounded-full animate-pulse"></div>
          <div className="relative bg-white p-4 rounded-full">
            <Brain className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h3 className="text-xl font-semibold text-slate-800">Analyzing Your Resume with AI</h3>
          <p className="text-slate-600">Lightning-fast AI analysis in progress...</p>
        </div>
        
        <div className="flex items-center justify-center space-x-8 text-sm text-slate-500">
          <div className="flex items-center space-x-2">
            <Zap className="w-4 h-4 animate-pulse text-green-500" />
            <span>Extracting content</span>
          </div>
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <span>AI analysis</span>
          </div>
          <div className="flex items-center space-x-2">
            <Loader2 className="w-4 h-4 animate-spin text-purple-500" style={{ animationDelay: '0.5s' }} />
            <span>Generating insights</span>
          </div>
        </div>
        
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div className="bg-gradient-to-r from-green-500 to-blue-600 h-2 rounded-full animate-pulse" style={{ width: '75%' }}></div>
        </div>
        
        <div className="text-xs text-slate-500">
          Powered by optimized AI inference infrastructure
        </div>
      </div>
    </div>
  );
};