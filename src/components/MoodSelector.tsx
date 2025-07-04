import React from 'react';
import { Zap, Heart, Briefcase, Smile, Trophy } from 'lucide-react';

export type AnalysisMood = 'brutal' | 'soft' | 'professional' | 'witty' | 'motivational';

interface MoodSelectorProps {
  selectedMood: AnalysisMood;
  onMoodChange: (mood: AnalysisMood) => void;
}

const moodOptions = [
  {
    id: 'brutal' as const,
    name: 'Brutal & Blunt',
    icon: Zap,
    description: 'Straight-up, no sugarcoating',
    color: 'red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    textColor: 'text-red-700',
    iconColor: 'text-red-600'
  },
  {
    id: 'soft' as const,
    name: 'Soft & Cute',
    icon: Heart,
    description: 'Kind and encouraging',
    color: 'pink',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-300',
    textColor: 'text-pink-700',
    iconColor: 'text-pink-600'
  },
  {
    id: 'professional' as const,
    name: 'Professional',
    icon: Briefcase,
    description: 'Clean and corporate',
    color: 'blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    textColor: 'text-blue-700',
    iconColor: 'text-blue-600'
  },
  {
    id: 'witty' as const,
    name: 'Witty & Sarcastic',
    icon: Smile,
    description: 'Fun and edgy with humor',
    color: 'purple',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    textColor: 'text-purple-700',
    iconColor: 'text-purple-600'
  },
  {
    id: 'motivational' as const,
    name: 'Motivational',
    icon: Trophy,
    description: 'Coach-like and inspiring',
    color: 'orange',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    textColor: 'text-orange-700',
    iconColor: 'text-orange-600'
  }
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onMoodChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Trophy className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-slate-800">Analysis Tone</h3>
        <div className="ml-auto text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
          Choose your feedback style
        </div>
      </div>
      
      <p className="text-sm text-slate-600 mb-4">
        Select how you'd like to receive your feedback. The analysis depth and accuracy remain the same—only the delivery style changes.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {moodOptions.map((mood) => {
          const Icon = mood.icon;
          const isSelected = selectedMood === mood.id;
          
          return (
            <button
              key={mood.id}
              onClick={() => onMoodChange(mood.id)}
              className={`
                p-4 rounded-lg border-2 transition-all duration-200 text-left
                ${isSelected 
                  ? `${mood.bgColor} ${mood.borderColor} shadow-md scale-105` 
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-5 h-5 ${isSelected ? mood.iconColor : 'text-slate-500'}`} />
                <span className={`font-medium text-sm ${isSelected ? mood.textColor : 'text-slate-700'}`}>
                  {mood.name}
                </span>
              </div>
              <p className={`text-xs ${isSelected ? mood.textColor : 'text-slate-500'}`}>
                {mood.description}
              </p>
            </button>
          );
        })}
      </div>
      
      <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
        <div className="flex items-center gap-2 text-sm text-indigo-700">
          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
          <span className="font-medium">Same accuracy, different style</span>
        </div>
        <p className="text-xs text-indigo-600 mt-1">
          All feedback modes provide identical analysis depth and honesty—only the presentation changes.
        </p>
      </div>
    </div>
  );
};