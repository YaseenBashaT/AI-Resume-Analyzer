import React, { useState } from 'react';
import { Zap, Eye, EyeOff, ExternalLink, CheckCircle, Key, ToggleLeft as Toggle, Shield } from 'lucide-react';

interface ApiKeyInputProps {
  value: string;
  onChange: (value: string) => void;
  useOwnApi: boolean;
  onToggleApiMode: (useOwn: boolean) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ 
  value, 
  onChange, 
  useOwnApi, 
  onToggleApiMode 
}) => {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Zap className="w-5 h-5 text-green-600" />
        <h3 className="text-lg font-semibold text-slate-800">AI Analysis Configuration</h3>
        <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          Active
        </div>
      </div>
      
      <div className="space-y-4">
        {/* API Mode Toggle */}
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-slate-800">API Configuration</span>
            </div>
            <button
              onClick={() => onToggleApiMode(!useOwnApi)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                useOwnApi ? 'bg-blue-600' : 'bg-slate-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  useOwnApi ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div className={`p-3 rounded-lg border-2 transition-all ${
              !useOwnApi 
                ? 'border-green-300 bg-green-50 text-green-800' 
                : 'border-slate-200 bg-white text-slate-600'
            }`}>
              <div className="font-medium mb-1">🏢 Our API (Default)</div>
              <div className="text-xs">Free, fast analysis with our Groq integration</div>
            </div>
            
            <div className={`p-3 rounded-lg border-2 transition-all ${
              useOwnApi 
                ? 'border-blue-300 bg-blue-50 text-blue-800' 
                : 'border-slate-200 bg-white text-slate-600'
            }`}>
              <div className="font-medium mb-1">🔑 Your API Key</div>
              <div className="text-xs">Use your own Groq API for unlimited access</div>
            </div>
          </div>
        </div>

        {/* Conditional API Key Input */}
        {useOwnApi && (
          <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
            <label htmlFor="groq-api-key" className="block text-sm font-medium text-slate-700">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Your Groq API Key
              </div>
            </label>
            <div className="relative">
              <input
                id="groq-api-key"
                type={showKey ? 'text' : 'password'}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Enter your Groq API key..."
                className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Get your free API key from{' '}
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline"
              >
                Groq Console
              </a>
            </p>
          </div>
        )}

        {/* Status Display */}
        {!useOwnApi ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="font-medium text-green-800">Ready to Analyze</span>
            </div>
            <p className="text-sm text-green-700">
              Using our optimized Groq API integration with {import.meta.env.VITE_GROQ_MODEL || 'LLaMA 3.1 8B Instant'} for lightning-fast resume analysis.
            </p>
          </div>
        ) : value && value !== 'default-key' ? (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-800">Your API Connected</span>
            </div>
            <p className="text-sm text-blue-700">
              Using your personal Groq API key for unlimited analysis.
            </p>
          </div>
        ) : useOwnApi && (!value || value === 'default-key') ? (
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-5 h-5 text-orange-600" />
              <span className="font-medium text-orange-800">API Key Required</span>
            </div>
            <p className="text-sm text-orange-700">
              Please enter your Groq API key above to continue with analysis.
            </p>
          </div>
        ) : null}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">⚡ Ultra Fast</div>
            <div className="text-xs text-blue-600">Sub-second analysis</div>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="text-lg font-bold text-purple-600">🎯 Accurate</div>
            <div className="text-xs text-purple-600">Advanced AI insights</div>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="text-lg font-bold text-orange-600">🔒 Secure</div>
            <div className="text-xs text-orange-600">Enterprise-grade API</div>
          </div>
        </div>
        
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h4 className="font-medium text-slate-800 mb-2">Enhanced Analysis Features:</h4>
          <ul className="text-sm text-slate-600 space-y-1">
            <li>• AI-powered content analysis and feedback</li>
            <li>• Intelligent skills extraction across all domains</li>
            <li>• Advanced soft skills assessment</li>
            <li>• Smart job description matching</li>
            <li>• Multi-engineering discipline support</li>
          </ul>
        </div>
        
        <div className="flex items-center justify-between text-sm text-slate-600">
          <span>Powered by Groq's optimized inference infrastructure</span>
          <a
            href="https://groq.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors"
          >
            Learn More
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};