import React, { useState } from 'react';
import { 
  Award, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  RefreshCw,
  Star,
  User,
  Briefcase,
  GraduationCap,
  Code,
  BarChart3,
  Zap,
  Copy,
  Eye,
  Clock,
  MapPin,
  Building,
  ChevronDown,
  ChevronUp,
  Shield,
  FileText,
  Lightbulb,
  TrendingDown
} from 'lucide-react';
import type { AnalysisResult } from '../types/analysis';
import type { AnalysisMood } from './MoodSelector';
import { MoodAnalyzer } from '../services/moodAnalyzer';

interface AnalysisResultsProps {
  result: AnalysisResult;
  onReset: () => void;
  mood?: AnalysisMood;
}

export const AnalysisResults: React.FC<AnalysisResultsProps> = ({ result, onReset, mood = 'professional' }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Early return check for critical missing data
  if (!result || !result.actionVerbAnalysis || !result.softSkillsInference || !result.consistencyCheck || !result.quantificationAnalysis) {
    return <div className="text-red-600">Analysis failed: missing data. Please reupload your resume.</div>;
  }

  // Get mood-specific theme
  const moodTheme = MoodAnalyzer.getMoodTheme(mood);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getScoreGradient = (score: number) => {
    if (score >= 80) return 'from-green-500 to-green-600';
    if (score >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800">Resume Analysis Report</h2>
          {mood !== 'professional' && (
            <div className={`px-3 py-1 rounded-full text-xs font-medium ${moodTheme.cardBg} ${moodTheme.textColor} ${moodTheme.borderColor} border`}>
              {mood.charAt(0).toUpperCase() + mood.slice(1)} Mode
            </div>
          )}
          <button
            onClick={onReset}
            className="flex items-center space-x-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Analyze Another</span>
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${getScoreBg(result.overallScore || 0)} mb-3`}>
              <span className={`text-2xl font-bold ${getScoreColor(result.overallScore || 0)}`}>
                {result.overallScore || 0}
              </span>
            </div>
            <p className="text-sm text-slate-600">Overall Score</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-3">
              <Building className="w-8 h-8 text-blue-600" />
            </div>
            <p className="text-sm text-slate-600">Detected Role</p>
            <p className="text-lg font-semibold text-slate-800">{result?.roleAlignment?.detectedRole || 'Unknown'}</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-100 mb-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-sm text-slate-600">Seniority Level</p>
            <p className="text-lg font-semibold text-slate-800">{result?.seniorityEstimation?.level || 'Unknown'}</p>
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 mb-3">
              <MapPin className="w-8 h-8 text-orange-600" />
            </div>
            <p className="text-sm text-slate-600">Industry</p>
            <p className="text-lg font-semibold text-slate-800">{result?.industryDetection?.primaryIndustry || 'Unknown'}</p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{result?.quantificationAnalysis?.metricsFound?.length ?? 0}</div>
            <div className="text-sm text-slate-600">Metrics Found</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{result?.actionVerbAnalysis?.strongVerbs?.length ?? 0}</div>
            <div className="text-sm text-slate-600">Strong Verbs</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{result?.extractedSkills?.length ?? 0}</div>
            <div className="text-sm text-slate-600">Skills Detected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{result?.timelineAnalysis?.gaps?.length ?? 0}</div>
            <div className="text-sm text-slate-600">Timeline Gaps</div>
          </div>
        </div>
      </div>

      {/* Mood-Specific Summary */}
      {result.moodSpecificSummary && (
        <div className={`rounded-xl shadow-sm border p-6 ${mood !== 'professional' ? moodTheme.cardBg + ' ' + moodTheme.borderColor : 'bg-white border-slate-200'}`}>
          <h3 className={`text-lg font-semibold mb-3 ${mood !== 'professional' ? moodTheme.textColor : 'text-slate-800'}`}>
            {mood === 'brutal' && '💀 Reality Check'}
            {mood === 'soft' && '💕 Gentle Summary'}
            {mood === 'professional' && '📋 Executive Summary'}
            {mood === 'witty' && '😏 The Real Talk'}
            {mood === 'motivational' && '🚀 Champion Summary'}
          </h3>
          <p className={`leading-relaxed ${mood !== 'professional' ? moodTheme.textColor + ' ' + moodTheme.font : 'text-slate-700'}`}>
            {result.moodSpecificSummary}
          </p>
        </div>
      )}
      
      {/* Fallback to regular summary if mood-specific isn't available */}
      {!result.moodSpecificSummary && result.summary && (
        <div className={`rounded-xl shadow-sm border p-6 ${mood !== 'professional' ? moodTheme.cardBg + ' ' + moodTheme.borderColor : 'bg-white border-slate-200'}`}>
          <h3 className={`text-lg font-semibold mb-3 ${mood !== 'professional' ? moodTheme.textColor : 'text-slate-800'}`}>
            📋 Resume Summary
          </h3>
          <p className={`leading-relaxed ${mood !== 'professional' ? moodTheme.textColor + ' ' + moodTheme.font : 'text-slate-700'}`}>
            {result.summary}
          </p>
        </div>
      )}

      {/* Comprehensive Score Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6 flex items-center">
          <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
          Detailed Score Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(result?.detailedScores || {}).map(([category, score]) => (
            <div key={category} className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  {getCategoryIcon(category)}
                  <span className="font-medium text-slate-700 capitalize">
                    {category.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
                  {score}%
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Analysis Sections */}
      
      {/* Quantification Analysis */}
      <ExpandableSection
        title="Quantification & Impact Analysis"
        icon={<BarChart3 className="w-5 h-5 text-green-600" />}
        score={result?.quantificationAnalysis?.score ?? 0}
        isExpanded={expandedSections.quantification}
        onToggle={() => toggleSection('quantification')}
      >
        <div className="space-y-4">
          {(result?.quantificationAnalysis?.metricsFound?.length ?? 0) > 0 && (
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Quantified Achievements Found:</h4>
              <div className="flex flex-wrap gap-2">
                {(result?.quantificationAnalysis?.metricsFound ?? []).map((metric, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                    {metric}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {(result?.quantificationAnalysis?.missingMetrics?.length ?? 0) > 0 && (
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Consider Adding:</h4>
              <div className="space-y-2">
                {(result?.quantificationAnalysis?.missingMetrics ?? []).map((metric, index) => (
                  <div key={index} className="flex items-center space-x-2 text-slate-600">
                    <Target className="w-4 h-4 text-orange-500" />
                    <span>{metric}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ExpandableSection>

      {/* Action Verb Analysis */}
      <ExpandableSection
        title="Action Verb & Language Analysis"
        icon={<Zap className="w-5 h-5 text-blue-600" />}
        score={result?.actionVerbAnalysis?.score ?? 0}
        isExpanded={expandedSections.actionVerbs}
        onToggle={() => toggleSection('actionVerbs')}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-slate-800 mb-3 flex items-center">
              <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
              Strong Action Verbs ({result?.actionVerbAnalysis?.strongVerbs?.length ?? 0})
            </h4>
            <div className="flex flex-wrap gap-2">
              {(result?.actionVerbAnalysis?.strongVerbs ?? []).map((verb, index) => (
                <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm capitalize">
                  {verb}
                </span>
              ))}
            </div>
          </div>
          
          {(result?.actionVerbAnalysis?.weakVerbs?.length ?? 0) > 0 && (
            <div>
              <h4 className="font-medium text-slate-800 mb-3 flex items-center">
                <AlertTriangle className="w-4 h-4 text-orange-600 mr-2" />
                Weak Phrases to Replace ({result?.actionVerbAnalysis?.weakVerbs?.length ?? 0})
              </h4>
              <div className="flex flex-wrap gap-2">
                {(result?.actionVerbAnalysis?.weakVerbs ?? []).map((verb, index) => (
                  <span key={index} className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                    {verb}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {(result?.actionVerbAnalysis?.suggestions?.length ?? 0) > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-slate-800 mb-2">Suggestions:</h4>
            <ul className="space-y-1">
              {(result?.actionVerbAnalysis?.suggestions ?? []).map((suggestion, index) => (
                <li key={index} className="text-slate-700 flex items-start">
                  <Lightbulb className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </ExpandableSection>

      {/* Soft Skills Inference */}
      <ExpandableSection
        title="Soft Skills & Leadership Analysis"
        icon={<User className="w-5 h-5 text-purple-600" />}
        score={Math.round(((result?.softSkillsInference?.leadership ?? 0) + (result?.softSkillsInference?.communication ?? 0) + (result?.softSkillsInference?.problemSolving ?? 0) + (result?.softSkillsInference?.teamwork ?? 0)) / 4)}
        isExpanded={expandedSections.softSkills}
        onToggle={() => toggleSection('softSkills')}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(result?.softSkillsInference || {}).filter(([key]) => key !== 'inferredQualities').map(([skill, score]) => (
              <div key={skill} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-slate-700 capitalize">{skill.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className={`text-sm font-semibold ${getScoreColor(score as number)}`}>{score}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full bg-gradient-to-r ${getScoreGradient(score as number)}`}
                    style={{ width: `${score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          {(result?.softSkillsInference?.inferredQualities?.length ?? 0) > 0 && (
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Inferred Qualities:</h4>
              <div className="space-y-2">
                {(result?.softSkillsInference?.inferredQualities ?? []).map((quality, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
                    <Star className="w-4 h-4 text-purple-600" />
                    <span className="text-slate-700">{quality}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </ExpandableSection>

      {/* Consistency & Quality Check */}
      <ExpandableSection
        title="Consistency & Quality Analysis"
        icon={<Shield className="w-5 h-5 text-indigo-600" />}
        score={result?.consistencyCheck?.score ?? 0}
        isExpanded={expandedSections.consistency}
        onToggle={() => toggleSection('consistency')}
      >
        <div className="space-y-4">
          {[
            { title: 'Date Format Issues', items: result?.consistencyCheck?.dateFormatIssues ?? [], color: 'red' },
            { title: 'Tense Issues', items: result?.consistencyCheck?.tenseIssues ?? [], color: 'orange' },
            { title: 'Formatting Issues', items: result?.consistencyCheck?.formattingIssues ?? [], color: 'yellow' }
          ].map(({ title, items, color }) => (
            items.length > 0 && (
              <div key={title}>
                <h4 className="font-medium text-slate-800 mb-2">{title}:</h4>
                <div className="space-y-2">
                  {items.map((issue, index) => (
                    <div key={index} className={`flex items-start space-x-2 p-2 bg-${color}-50 rounded-lg`}>
                      <AlertTriangle className={`w-4 h-4 text-${color}-600 mt-0.5 flex-shrink-0`} />
                      <span className="text-slate-700">{issue}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}
          
          {(result?.redundancyAnalysis?.repeatedPhrases?.length ?? 0) > 0 && (
            <div>
              <h4 className="font-medium text-slate-800 mb-2">Repeated Phrases to Vary:</h4>
              <div className="flex flex-wrap gap-2">
                {(result?.redundancyAnalysis?.repeatedPhrases ?? []).map((phrase, index) => (
                  <span key={index} className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm">
                    "{phrase}"
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </ExpandableSection>

      {/* Timeline Analysis */}
      {(result?.timelineAnalysis?.gaps?.length ?? 0) > 0 && (
        <ExpandableSection
          title="Timeline & Career Gap Analysis"
          icon={<Clock className="w-5 h-5 text-red-600" />}
          score={result?.timelineAnalysis?.score ?? 0}
          isExpanded={expandedSections.timeline}
          onToggle={() => toggleSection('timeline')}
        >
          <div className="space-y-3">
            {(result?.timelineAnalysis?.gaps ?? []).map((gap, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                gap.severity === 'major' ? 'bg-red-50 border-red-400' :
                gap.severity === 'moderate' ? 'bg-orange-50 border-orange-400' :
                'bg-yellow-50 border-yellow-400'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-slate-800">{gap.period}</span>
                  <span className={`text-sm px-2 py-1 rounded-full ${
                    gap.severity === 'major' ? 'bg-red-100 text-red-700' :
                    gap.severity === 'moderate' ? 'bg-orange-100 text-orange-700' :
                    'bg-yellow-100 text-yellow-700'
                  }`}>
                    {gap.duration} gap
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  Consider adding explanation or relevant activities during this period
                </p>
              </div>
            ))}
          </div>
        </ExpandableSection>
      )}

      {/* Enhancement Recommendations */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
          Enhancement Recommendations
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Keyword Suggestions */}
          {(result?.keywordSuggestions?.length ?? 0) > 0 && (
            <div>
              <h4 className="font-medium text-slate-800 mb-3">Suggested Keywords for ATS:</h4>
              <div className="flex flex-wrap gap-2">
                {(result?.keywordSuggestions ?? []).map((keyword, index) => (
                  <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Missing Sections */}
          {(result?.missingSections?.length ?? 0) > 0 && (
            <div>
              <h4 className="font-medium text-slate-800 mb-3">Consider Adding Sections:</h4>
              <div className="space-y-2">
                {(result?.missingSections ?? []).map((section, index) => (
                  <div key={index} className="flex items-center space-x-2 text-slate-600">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <span>{section}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Impact Optimization */}
        {(result?.impactOptimization?.length ?? 0) > 0 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
            <h4 className="font-medium text-slate-800 mb-3">Impact Optimization Suggestions:</h4>
            <div className="space-y-2">
              {(result?.impactOptimization ?? []).map((suggestion, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span className="text-slate-700">{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Traditional Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className={`rounded-xl shadow-sm border p-6 ${mood !== 'professional' ? moodTheme.cardBg + ' ' + moodTheme.borderColor : 'bg-white border-slate-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${mood !== 'professional' ? moodTheme.textColor : 'text-slate-800'}`}>
            <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
            {mood === 'brutal' && 'What You Got Right'}
            {mood === 'soft' && 'Your Beautiful Strengths ✨'}
            {mood === 'professional' && 'Key Strengths'}
            {mood === 'witty' && 'Actually Not Bad 👌'}
            {mood === 'motivational' && 'POWER MOVES 💪'}
          </h3>
          
          <div className="space-y-3">
            {((result?.moodSpecificStrengths || result?.strengths) ?? []).map((strength, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p className={`${mood !== 'professional' ? moodTheme.textColor + ' ' + moodTheme.font : 'text-slate-700'}`}>
                  {strength}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Improvements */}
        <div className={`rounded-xl shadow-sm border p-6 ${mood !== 'professional' ? moodTheme.cardBg + ' ' + moodTheme.borderColor : 'bg-white border-slate-200'}`}>
          <h3 className={`text-lg font-semibold mb-4 flex items-center ${mood !== 'professional' ? moodTheme.textColor : 'text-slate-800'}`}>
            <Target className="w-5 h-5 mr-2 text-orange-600" />
            {mood === 'brutal' && 'Fix This Now'}
            {mood === 'soft' && 'Gentle Suggestions 🌱'}
            {mood === 'professional' && 'Priority Improvements'}
            {mood === 'witty' && 'Room for Improvement 🤷‍♂️'}
            {mood === 'motivational' && 'LEVEL UP ZONES 🎯'}
          </h3>
          
          <div className="space-y-3">
            {((result?.moodSpecificImprovements || result?.improvements) ?? []).map((improvement, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className={`${mood !== 'professional' ? moodTheme.textColor + ' ' + moodTheme.font : 'text-slate-700'}`}>
                  {improvement}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills & Privacy */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Extracted Skills */}
        {(result?.extractedSkills?.length ?? 0) > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
              <Code className="w-5 h-5 mr-2 text-purple-600" />
              Extracted Skills ({result?.extractedSkills?.length ?? 0})
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {(result?.extractedSkills ?? []).map((skill, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Privacy Information */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Shield className="w-5 h-5 mr-2 text-indigo-600" />
            Privacy & PII Detection
          </h3>
          
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Email Addresses:</span>
              <span className="font-medium">{result?.piiDetected?.emails?.length ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Phone Numbers:</span>
              <span className="font-medium">{result?.piiDetected?.phones?.length ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Social Media:</span>
              <span className="font-medium">{result?.piiDetected?.socialMedia?.length ?? 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Addresses:</span>
              <span className="font-medium">{result?.piiDetected?.addresses?.length ?? 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ExpandableSectionProps {
  title: string;
  icon: React.ReactNode;
  score: number;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const ExpandableSection: React.FC<ExpandableSectionProps> = ({
  title,
  icon,
  score,
  isExpanded,
  onToggle,
  children
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <button
        onClick={onToggle}
        className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {icon}
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
        </div>
        <div className="flex items-center space-x-3">
          <span className={`text-sm font-semibold ${getScoreColor(score)}`}>
            {score}%
          </span>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-slate-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-slate-400" />
          )}
        </div>
      </button>
      
      {isExpanded && (
        <div className="px-6 pb-6 border-t border-slate-100">
          <div className="pt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  );
};

const getCategoryIcon = (category: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    contactInformation: <User className="w-5 h-5 text-blue-600" />,
    workExperience: <Briefcase className="w-5 h-5 text-green-600" />,
    education: <GraduationCap className="w-5 h-5 text-purple-600" />,
    skills: <Code className="w-5 h-5 text-orange-600" />,
    formatting: <FileText className="w-5 h-5 text-pink-600" />,
    quantification: <BarChart3 className="w-5 h-5 text-green-600" />,
    actionVerbs: <Zap className="w-5 h-5 text-blue-600" />,
    consistency: <Shield className="w-5 h-5 text-indigo-600" />,
  };
  
  return iconMap[category] || <Award className="w-5 h-5 text-gray-600" />;
};