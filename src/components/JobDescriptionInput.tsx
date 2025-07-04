import React, { useState } from 'react';
import { FileText, Target, Zap, TrendingUp, Clock, Sparkles } from 'lucide-react';
import type { JobDescriptionMatch } from '../types/analysis';

interface JobDescriptionInputProps {
  onAnalyze: (jobDescription: string) => Promise<JobDescriptionMatch>;
  isAnalyzing: boolean;
}

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({ onAnalyze, isAnalyzing }) => {
  const [jobDescription, setJobDescription] = useState('');
  const [matchResult, setMatchResult] = useState<JobDescriptionMatch | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;
    
    try {
      const result = await onAnalyze(jobDescription);
      setMatchResult(result);
    } catch (error) {
      console.error('Error analyzing job match:', error);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden">
      {/* Coming Soon Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/90 to-purple-50/90 backdrop-blur-sm z-10 flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="relative">
            <div className="w-16 h-16 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
              <span className="text-xs font-bold text-yellow-900">✨</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Coming Soon!
            </h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Advanced job description matching with AI-powered compatibility scoring is currently in development.
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-500">
            <Clock className="w-4 h-4" />
            <span>Expected release: Next update</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-xs">
            <div className="p-2 bg-white/60 rounded-lg border border-blue-200">
              <div className="font-medium text-blue-700">🎯 Smart Matching</div>
              <div className="text-slate-600">AI-powered compatibility</div>
            </div>
            <div className="p-2 bg-white/60 rounded-lg border border-purple-200">
              <div className="font-medium text-purple-700">📊 Detailed Insights</div>
              <div className="text-slate-600">Gap analysis & tips</div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Content (Disabled) */}
      <div className="opacity-30 pointer-events-none">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-slate-800">Job Description Matching</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="job-description" className="block text-sm font-medium text-slate-700 mb-2">
              Paste Job Description (Optional)
            </label>
            <textarea
              id="job-description"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here to get a tailored match analysis..."
              rows={6}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
              disabled
            />
          </div>
          
          <button
            disabled
            className="w-full px-4 py-3 bg-slate-300 text-slate-500 rounded-lg cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            <Zap className="w-4 h-4" />
            <span>Analyze Job Match</span>
          </button>
        </div>
      </div>

      {/* Hover Animation Trigger */}
      <div 
        className="absolute inset-0 z-20"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {isHovered && (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 animate-pulse" />
        )}
      </div>
    </div>
  );
};