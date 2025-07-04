export interface AnalysisResult {
  overallScore: number;
  detailedScores: {
    contactInformation: number;
    workExperience: number;
    education: number;
    skills: number;
    formatting: number;
    quantification: number;
    actionVerbs: number;
    consistency: number;
  };
  strengths: string[];
  improvements: string[];
  extractedSkills: string[];
  summary: string;
  
  // Advanced Analysis Features
  quantificationAnalysis: {
    metricsFound: string[];
    missingMetrics: string[];
    score: number;
  };
  
  actionVerbAnalysis: {
    strongVerbs: string[];
    weakVerbs: string[];
    suggestions: string[];
    score: number;
  };
  
  redundancyAnalysis: {
    repeatedPhrases: string[];
    duplicatedAchievements: string[];
    score: number;
  };
  
  softSkillsInference: {
    leadership: number;
    adaptability: number;
    communication: number;
    problemSolving: number;
    teamwork: number;
    inferredQualities: string[];
  };
  
  consistencyCheck: {
    dateFormatIssues: string[];
    tenseIssues: string[];
    formattingIssues: string[];
    score: number;
  };
  
  sectionOrdering: {
    currentOrder: string[];
    recommendedOrder: string[];
    issues: string[];
    score: number;
  };
  
  timelineAnalysis: {
    gaps: Array<{
      period: string;
      duration: string;
      severity: 'minor' | 'moderate' | 'major';
    }>;
    score: number;
  };
  
  // Role Matching Features
  roleAlignment: {
    detectedRole: string;
    confidence: number;
    alternativeRoles: string[];
  };
  
  seniorityEstimation: {
    level: 'Intern' | 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Executive';
    confidence: number;
    indicators: string[];
  };
  
  industryDetection: {
    primaryIndustry: string;
    secondaryIndustries: string[];
    confidence: number;
  };
  
  // Enhancement Suggestions
  keywordSuggestions: string[];
  impactOptimization: string[];
  lengthOptimization: {
    currentLength: number;
    recommendedLength: number;
    suggestions: string[];
  };
  
  missingSections: string[];
  
  // Privacy & Security
  piiDetected: {
    emails: string[];
    phones: string[];
    addresses: string[];
    socialMedia: string[];
  };
}

export interface JobDescriptionMatch {
  overallMatch: number;
  skillsMatch: number;
  experienceMatch: number;
  missingSkills: string[];
  matchingSkills: string[];
  recommendations: string[];
}

export interface HuggingFaceResponse {
  generated_text?: string;
  summary_text?: string;
  label?: string;
  score?: number;
}

export interface BatchAnalysisResult {
  results: AnalysisResult[];
  summary: {
    averageScore: number;
    commonIssues: string[];
    topPerformers: number[];
  };
}