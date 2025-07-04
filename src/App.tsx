import React, { useState, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { AnalysisResults } from './components/AnalysisResults';
import { ApiKeyInput } from './components/ApiKeyInput';
import { JobDescriptionInput } from './components/JobDescriptionInput';
import { Header } from './components/Header';
import { LoadingSpinner } from './components/LoadingSpinner';
import { MoodSelector, type AnalysisMood } from './components/MoodSelector';
import { HuggingFaceService } from './services/huggingface';
import { MoodAnalyzer } from './services/moodAnalyzer';
import type { AnalysisResult, JobDescriptionMatch } from './types/analysis';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string>('');
  const [resumeText, setResumeText] = useState<string>('');
  const [apiKey, setApiKey] = useState<string>('');
  const [useOwnApi, setUseOwnApi] = useState<boolean>(false);
  const [selectedMood, setSelectedMood] = useState<AnalysisMood>('professional');

  // Updated default API key with the new one you provided
  const defaultApiKey = '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';

  // Create HuggingFace service instance with appropriate API key
  const huggingFaceService = useMemo(() => {
    const effectiveApiKey = useOwnApi ? apiKey : defaultApiKey;
    console.log('🔑 Using API key mode:', useOwnApi ? 'User API' : 'Default API');
    console.log('🔑 Effective API key length:', effectiveApiKey.length);
    return new HuggingFaceService(effectiveApiKey);
  }, [apiKey, useOwnApi, defaultApiKey]);

  const handleFileUpload = async (file: File) => {
    // Check if user wants to use their own API but hasn't provided a key
    if (useOwnApi && (!apiKey || apiKey.trim() === '')) {
      setError('⚠️ Please enter your API key or switch to use our API.');
      return;
    }

    setIsAnalyzing(true);
    setError('');
    setAnalysisResult(null);

    try {
      console.log('🚀 Starting resume analysis...');
      console.log('📁 File:', file.name, 'Size:', file.size, 'Type:', file.type);
      console.log('🔑 API Mode:', useOwnApi ? 'User API' : 'Default API');
      
      const result = await huggingFaceService.analyzeResume(file, selectedMood);
      setAnalysisResult(result);
      // Store resume text for job matching
      const text = await file.text();
      setResumeText(text);
      
      console.log('✅ Analysis completed successfully');
    } catch (err) {
      console.error('❌ Analysis failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed. Please try again.';
      
      // Provide more helpful error messages based on the error type
      if (errorMessage.includes('401') || errorMessage.includes('Invalid API Key')) {
        if (useOwnApi) {
          setError(`⚠️ Invalid API key. Please check your API key or switch to use our API.`);
        } else {
          setError(`⚠️ Our API service is temporarily unavailable. Please try using your own API key.`);
        }
      } else if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
        setError(`⚠️ Rate limit exceeded. Please wait a moment and try again, or use your own API key for unlimited access.`);
      } else {
        setError(`⚠️ Unable to analyze resume. Reason: ${errorMessage}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleJobDescriptionAnalysis = async (jobDescription: string): Promise<JobDescriptionMatch> => {
    if (!resumeText) {
      throw new Error('Please analyze a resume first');
    }
    
    console.log('🎯 Starting job description analysis...');
    return await huggingFaceService.compareWithJobDescription(resumeText, jobDescription);
  };

  const handleReset = () => {
    setAnalysisResult(null);
    setError('');
    setResumeText('');
    console.log('🔄 Reset analysis state');
  };

  const handleToggleApiMode = (useOwn: boolean) => {
    setUseOwnApi(useOwn);
    // Clear any existing errors when switching modes
    setError('');
    console.log('🔄 Switched API mode to:', useOwn ? 'User API' : 'Default API');
  };

  // Get mood-specific theme
  const moodTheme = MoodAnalyzer.getMoodTheme(selectedMood);

  return (
    <div className={`min-h-screen bg-gradient-to-br ${moodTheme.bgGradient}`}>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Header />
        
        <div className="mt-12 space-y-8">
          <MoodSelector 
            selectedMood={selectedMood} 
            onMoodChange={setSelectedMood}
          />
          
          <ApiKeyInput 
            value={apiKey} 
            onChange={setApiKey}
            useOwnApi={useOwnApi}
            onToggleApiMode={handleToggleApiMode}
          />
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {isAnalyzing ? (
            <LoadingSpinner />
          ) : analysisResult ? (
            <div className="space-y-8">
              <AnalysisResults 
                result={analysisResult} 
                onReset={handleReset}
                mood={selectedMood}
              />
              
              {/* Job Description Matching */}
              <JobDescriptionInput 
                onAnalyze={handleJobDescriptionAnalysis}
                isAnalyzing={false}
              />
            </div>
          ) : (
            <FileUpload 
              onFileUpload={handleFileUpload}
              mood={selectedMood}
            />
          )}
        </div>
        
        {/* Footer with Groq attribution */}
        <footer className="mt-16 py-8 border-t border-slate-200">
          <div className="text-center">
            <p className="text-sm text-slate-500">
              Powered by Groq AI
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;