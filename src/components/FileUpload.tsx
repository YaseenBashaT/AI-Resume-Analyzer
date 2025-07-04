import React, { useCallback, useState } from 'react';
import { Upload, FileText, Zap, CheckCircle } from 'lucide-react';
import type { AnalysisMood } from './MoodSelector';
import { MoodAnalyzer } from '../services/moodAnalyzer';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  disabled?: boolean;
  mood?: AnalysisMood;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, disabled = false, mood = 'professional' }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    
    if (file && isValidFileType(file)) {
      onFileUpload(file);
    }
  }, [onFileUpload, disabled]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragOver(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidFileType(file)) {
      onFileUpload(file);
    }
  };

  const isValidFileType = (file: File) => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    return validTypes.includes(file.type) || file.name.endsWith('.txt');
  };

  // Get mood-specific theme
  const moodTheme = MoodAnalyzer.getMoodTheme(mood);

  return (
    <div className={`rounded-xl shadow-sm border p-8 ${mood !== 'professional' ? moodTheme.cardBg + ' ' + moodTheme.borderColor : 'bg-white border-slate-200'}`}>
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
          ${isDragOver && !disabled
            ? 'border-green-400 bg-green-50' 
            : disabled
            ? 'border-slate-200 bg-slate-50'
            : 'border-slate-300 hover:border-green-400 hover:bg-green-50/50'
          }
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
            <Upload className="w-8 h-8 text-white" />
          </div>
          
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-800">
              {mood === 'brutal' && 'Drop Your Resume (If You Dare)'}
              {mood === 'soft' && 'Share Your Beautiful Resume ✨'}
              {mood === 'professional' && 'Upload Your Resume'}
              {mood === 'witty' && 'Time to Spill the Tea 📄'}
              {mood === 'motivational' && 'UNLEASH YOUR RESUME! 🚀'}
            </h3>
            <p className={`text-sm ${mood !== 'professional' ? moodTheme.textColor : 'text-slate-600'}`}>
              {mood === 'brutal' && 'Drag and drop. Let\'s see what we\'re working with.'}
              {mood === 'soft' && 'Gently place your resume here, or click to browse 💕'}
              {mood === 'professional' && 'Drag and drop your resume here, or click to browse'}
              {mood === 'witty' && 'Drag, drop, and let the roasting begin 😏'}
              {mood === 'motivational' && 'DROP IT LIKE IT\'S HOT! Time to analyze greatness! 🔥'}
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-6 text-sm text-slate-500">
            <div className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>DOC</span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>DOCX</span>
            </div>
            <div className="flex items-center space-x-1">
              <FileText className="w-4 h-4" />
              <span>TXT</span>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-slate-800">AI Analysis Ready</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-xs text-slate-600">
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Lightning-fast processing</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Advanced AI insights</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Multi-domain skills detection</span>
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                <span>Intelligent analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};