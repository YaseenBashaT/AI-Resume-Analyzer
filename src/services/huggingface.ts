import type { AnalysisResult, JobDescriptionMatch } from '../types/analysis';
import { ResumeParser } from './resumeParser';
import { MoodAnalyzer } from './moodAnalyzer';
import type { AnalysisMood } from '../components/MoodSelector';

// Debug function to log resume content
const debugResumeContent = (text: string, functionName: string) => {
  console.log(`=== ${functionName} DEBUG ===`);
  console.log('Resume text length:', text.length);
  console.log('First 500 chars:', text.substring(0, 500));
  console.log('Contains "backend":', text.toLowerCase().includes('backend'));
  console.log('Contains "frontend":', text.toLowerCase().includes('frontend'));
  console.log('Contains "PHP":', text.toLowerCase().includes('php'));
  console.log('Contains "React":', text.toLowerCase().includes('react'));
  console.log('=== END DEBUG ===');
};

// Robust JSON sanitization and parsing utilities
const sanitizeLLMResponse = (raw: string): string => {
  console.log('🧹 Sanitizing LLM response...');
  console.log('Raw response length:', raw.length);
  console.log('First 200 chars:', raw.substring(0, 200));
  
  return raw
    .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove **bold**
    .replace(/\*(.*?)\*/g, '$1')      // Remove *italic*
    .replace(/\\n/g, '')              // Remove escaped newlines
    .replace(/[""]/g, '"')            // Replace fancy double quotes
    .replace(/['']/g, "'")            // Replace fancy single quotes
    .replace(/```json\s*/g, '')       // Remove markdown code blocks
    .replace(/```\s*$/g, '')          // Remove closing code blocks
    .replace(/^\s*```.*$/gm, '')      // Remove any remaining code block markers
    .trim();
};

const extractJSONFromResponse = (response: string): string | null => {
  console.log('🔍 Extracting JSON from response...');
  
  const cleaned = sanitizeLLMResponse(response);
  console.log('Cleaned response:', cleaned.substring(0, 300));
  
  // Try to find JSON boundaries for both objects and arrays
  const objectStart = cleaned.indexOf("{");
  const objectEnd = cleaned.lastIndexOf("}") + 1;
  const arrayStart = cleaned.indexOf("[");
  const arrayEnd = cleaned.lastIndexOf("]") + 1;

  let jsonStart = -1;
  let jsonEnd = -1;

  // Determine which comes first - object or array
  if (objectStart !== -1 && arrayStart !== -1) {
    // Both found, use whichever comes first
    if (objectStart < arrayStart) {
      jsonStart = objectStart;
      jsonEnd = objectEnd;
    } else {
      jsonStart = arrayStart;
      jsonEnd = arrayEnd;
    }
  } else if (objectStart !== -1) {
    // Only object found
    jsonStart = objectStart;
    jsonEnd = objectEnd;
  } else if (arrayStart !== -1) {
    // Only array found
    jsonStart = arrayStart;
    jsonEnd = arrayEnd;
  }

  if (jsonStart === -1 || jsonEnd === -1 || jsonStart >= jsonEnd) {
    console.warn('❌ No valid JSON boundaries found');
    return null;
  }

  const jsonText = cleaned.substring(jsonStart, jsonEnd);
  console.log('Extracted JSON text:', jsonText);
  return jsonText;
};

const parseWithFallback = <T>(response: string, fallbackValue: T, validator?: (obj: any) => boolean): T => {
  console.log('🔄 Attempting to parse JSON with fallback...');
  
  try {
    const jsonText = extractJSONFromResponse(response);
    if (!jsonText) {
      throw new Error('No JSON found in response');
    }

    const parsed = JSON.parse(jsonText);
    console.log('✅ Successfully parsed JSON:', parsed);
    
    // Validate structure if validator provided
    if (validator && !validator(parsed)) {
      console.warn('⚠️ Parsed JSON failed validation, using fallback');
      return fallbackValue;
    }
    
    return parsed;
  } catch (error) {
    console.error('❌ JSON parsing failed:', error);
    console.log('🔄 Using fallback value:', fallbackValue);
    return fallbackValue;
  }
};

const makeGroqRequest = async (messages: any[], apiKey: string, temperature = 0.1) => {
  console.log('🌐 Making Groq API request...');
  console.log('🔑 API Key length:', apiKey.length);
  console.log('🔑 API Key prefix:', apiKey.substring(0, 10) + '...');
  
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount <= maxRetries) {
    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages,
          temperature,
          max_tokens: 2000,
        }),
      });

      console.log('📡 Groq API Response Status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Groq API Error:', response.status, errorText);
        
        // Handle rate limiting with retry
        if (response.status === 429 && retryCount < maxRetries) {
          retryCount++;
          
          // Parse retry delay from error message or use exponential backoff
          let retryDelay = Math.pow(2, retryCount) * 1000; // Start with 2s, then 4s, then 8s
          
          // Try to extract delay from error message
          try {
            const errorData = JSON.parse(errorText);
            const errorMessage = errorData.error?.message || '';
            const delayMatch = errorMessage.match(/try again in ([\d.]+)s/);
            if (delayMatch) {
              retryDelay = Math.ceil(parseFloat(delayMatch[1]) * 1000) + 500; // Add 500ms buffer
            }
          } catch (e) {
            // Use default exponential backoff if parsing fails
          }
          
          console.log(`⏳ Rate limited. Retrying in ${retryDelay}ms (attempt ${retryCount}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue; // Retry the request
        }
        
        // Provide more specific error messages for non-retryable errors
        if (response.status === 401) {
          throw new Error(`Invalid API Key - Please check your Groq API key`);
        } else if (response.status === 429) {
          throw new Error(`Rate limit exceeded - Maximum retries reached. Please wait a few minutes and try again`);
        } else if (response.status === 500) {
          throw new Error(`Groq API server error - Please try again later`);
        } else {
          throw new Error(`Groq API error: ${response.status} - ${errorText}`);
        }
      }

      const data = await response.json();
      console.log('✅ Groq API Response received:', data.choices?.[0]?.message?.content?.length || 0, 'characters');
      return data.choices[0]?.message?.content || '';
      
    } catch (error) {
      // If it's a network error and we have retries left, try again
      if (retryCount < maxRetries && (error instanceof TypeError || error.message.includes('fetch'))) {
        retryCount++;
        const retryDelay = Math.pow(2, retryCount) * 1000;
        console.log(`🔄 Network error. Retrying in ${retryDelay}ms (attempt ${retryCount}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      // Re-throw the error if it's not retryable or we've exhausted retries
      throw error;
    }
  }
  
  // This should never be reached, but just in case
  throw new Error('Maximum retries exceeded');
};

const analyzeRoleWithGroq = async (resumeText: string, apiKey: string) => {
  debugResumeContent(resumeText, 'analyzeRoleWithGroq');
  
  const messages = [
    {
      role: 'system',
      content: `You are a resume analysis expert. Analyze the resume text and determine the candidate's primary role based ONLY on their actual experience, skills, and job titles mentioned in the resume.

CRITICAL: Base your analysis ONLY on what is explicitly stated in the resume. Do not make assumptions.

Return ONLY a JSON object in this exact format (no markdown, no explanations):
{
  "detectedRole": "exact role based on resume content",
  "confidence": 85,
  "alternativeRoles": ["role1", "role2"],
  "reasoning": "brief explanation of why this role was detected"
}`
    },
    {
      role: 'user',
      content: `Analyze this resume and detect the primary role:\n\n${resumeText}`
    }
  ];

  try {
    const response = await makeGroqRequest(messages, apiKey);
    console.log('Role analysis raw response:', response);
    
    const fallback = {
      detectedRole: 'Unknown',
      confidence: 0,
      alternativeRoles: [],
      reasoning: 'Analysis failed'
    };

    const validator = (obj: any) => {
      return typeof obj.detectedRole === 'string' && 
             typeof obj.confidence === 'number' &&
             Array.isArray(obj.alternativeRoles);
    };

    return parseWithFallback(response, fallback, validator);
  } catch (error) {
    console.error('Role analysis failed:', error);
    throw error; // Re-throw to propagate the error up
  }
};

const extractSkillsWithGroq = async (resumeText: string, apiKey: string) => {
  debugResumeContent(resumeText, 'extractSkillsWithGroq');
  
  const messages = [
    {
      role: 'system',
      content: `You are a resume analysis expert. Extract ONLY the technical skills, tools, technologies, and programming languages that are explicitly mentioned in the resume text.

CRITICAL RULES:
- Extract ONLY skills that are literally written in the resume
- Do NOT add skills that are not mentioned
- Do NOT make assumptions about skills based on job titles
- Do NOT add related or commonly used skills

Return ONLY a JSON array of strings (no markdown, no explanations):
["skill1", "skill2", "skill3"]`
    },
    {
      role: 'user',
      content: `Extract the explicitly mentioned skills from this resume:\n\n${resumeText}`
    }
  ];

  try {
    const response = await makeGroqRequest(messages, apiKey);
    console.log('Skills extraction raw response:', response);
    
    const fallback: string[] = [];
    
    const validator = (obj: any) => {
      return Array.isArray(obj) && obj.every(item => typeof item === 'string');
    };

    return parseWithFallback(response, fallback, validator);
  } catch (error) {
    console.error('Skills extraction failed:', error);
    throw error; // Re-throw to propagate the error up
  }
};

const analyzeSeniorityWithGroq = async (resumeText: string, apiKey: string) => {
  debugResumeContent(resumeText, 'analyzeSeniorityWithGroq');
  
  const messages = [
    {
      role: 'system',
      content: `You are a resume analysis expert. Analyze the resume and determine the candidate's seniority level based on:
- Years of experience mentioned
- Job titles and responsibilities
- Leadership or mentoring roles
- Project complexity and scope

Return ONLY a JSON object (no markdown, no explanations):
{
  "level": "Junior",
  "confidence": 75,
  "indicators": ["reason1", "reason2"],
  "yearsExperience": 3
}

Valid levels: Intern, Junior, Mid, Senior, Lead, Executive`
    },
    {
      role: 'user',
      content: `Analyze the seniority level from this resume:\n\n${resumeText}`
    }
  ];

  try {
    const response = await makeGroqRequest(messages, apiKey);
    console.log('Seniority analysis raw response:', response);
    
    const fallback = {
      level: 'Unknown',
      confidence: 0,
      indicators: [],
      yearsExperience: 0
    };

    const validator = (obj: any) => {
      const validLevels = ['Intern', 'Junior', 'Mid', 'Senior', 'Lead', 'Executive'];
      return typeof obj.level === 'string' && 
             typeof obj.confidence === 'number' &&
             Array.isArray(obj.indicators) &&
             typeof obj.yearsExperience === 'number';
    };

    return parseWithFallback(response, fallback, validator);
  } catch (error) {
    console.error('Seniority analysis failed:', error);
    throw error; // Re-throw to propagate the error up
  }
};

const analyzeQuantificationWithGroq = async (resumeText: string, apiKey: string) => {
  const messages = [
    {
      role: 'system',
      content: `Extract quantified achievements and metrics from the resume. Look for numbers, percentages, timeframes, and measurable results.

Return ONLY a JSON object (no markdown, no explanations):
{
  "metricsFound": ["metric1", "metric2"],
  "score": 75
}`
    },
    {
      role: 'user',
      content: `Find quantified achievements in this resume:\n\n${resumeText}`
    }
  ];

  try {
    const response = await makeGroqRequest(messages, apiKey);
    console.log('Quantification analysis raw response:', response);
    
    const fallback = {
      metricsFound: [],
      missingMetrics: [],
      score: 0
    };

    const validator = (obj: any) => {
      return Array.isArray(obj.metricsFound) && typeof obj.score === 'number';
    };

    const result = parseWithFallback(response, { metricsFound: [], score: 0 }, validator);
    
    return {
      metricsFound: result.metricsFound || [],
      missingMetrics: [],
      score: result.score || 0
    };
  } catch (error) {
    console.error('Quantification analysis failed:', error);
    throw error; // Re-throw to propagate the error up
  }
};

const analyzeActionVerbsWithGroq = async (resumeText: string, apiKey: string) => {
  const messages = [
    {
      role: 'system',
      content: `Analyze the action verbs used in the resume. Identify strong action verbs and weak/passive language.

Return ONLY a JSON object (no markdown, no explanations):
{
  "strongVerbs": ["verb1", "verb2"],
  "weakVerbs": ["weak1", "weak2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "score": 80
}`
    },
    {
      role: 'user',
      content: `Analyze action verbs in this resume:\n\n${resumeText}`
    }
  ];

  try {
    const response = await makeGroqRequest(messages, apiKey);
    console.log('Action verbs analysis raw response:', response);
    
    const fallback = {
      strongVerbs: [],
      weakVerbs: [],
      suggestions: [],
      score: 0
    };

    const validator = (obj: any) => {
      return Array.isArray(obj.strongVerbs) && 
             Array.isArray(obj.weakVerbs) && 
             Array.isArray(obj.suggestions) && 
             typeof obj.score === 'number';
    };

    return parseWithFallback(response, fallback, validator);
  } catch (error) {
    console.error('Action verbs analysis failed:', error);
    throw error; // Re-throw to propagate the error up
  }
};

const analyzeSoftSkillsWithGroq = async (resumeText: string, apiKey: string) => {
  const messages = [
    {
      role: 'system',
      content: `You are a resume analysis assistant. Analyze the resume text and score soft skills based on evidence found in the text.

CRITICAL: Return ONLY valid JSON with no markdown formatting, no explanations, no additional text.

Return this exact JSON structure:
{
  "leadership": 75,
  "communication": 80,
  "problemSolving": 70,
  "teamwork": 85,
  "adaptability": 60,
  "inferredQualities": ["quality1", "quality2"]
}

Scores should be 0-100 based on evidence in the resume.`
    },
    {
      role: 'user',
      content: `Analyze soft skills from this resume:\n\n${resumeText}`
    }
  ];

  try {
    const response = await makeGroqRequest(messages, apiKey);
    console.log('🎯 Soft skills raw response:', response);
    
    // Define fallback with proper structure
    const fallback = {
      leadership: 0,
      communication: 0,
      problemSolving: 0,
      teamwork: 0,
      adaptability: 0,
      inferredQualities: []
    };

    // Validator to ensure proper structure
    const validator = (obj: any) => {
      const requiredFields = ['leadership', 'communication', 'problemSolving', 'teamwork', 'adaptability'];
      
      // Check all required numeric fields exist and are numbers
      for (const field of requiredFields) {
        if (typeof obj[field] !== 'number' || obj[field] < 0 || obj[field] > 100) {
          console.warn(`❌ Invalid ${field} value:`, obj[field]);
          return false;
        }
      }
      
      // Check inferredQualities is an array
      if (!Array.isArray(obj.inferredQualities)) {
        console.warn('❌ inferredQualities is not an array:', obj.inferredQualities);
        return false;
      }
      
      return true;
    };

    const result = parseWithFallback(response, fallback, validator);
    
    // Additional safety check - ensure all values are within bounds
    const safeResult = {
      leadership: Math.max(0, Math.min(100, result.leadership || 0)),
      communication: Math.max(0, Math.min(100, result.communication || 0)),
      problemSolving: Math.max(0, Math.min(100, result.problemSolving || 0)),
      teamwork: Math.max(0, Math.min(100, result.teamwork || 0)),
      adaptability: Math.max(0, Math.min(100, result.adaptability || 0)),
      inferredQualities: Array.isArray(result.inferredQualities) ? result.inferredQualities : []
    };

    console.log('✅ Final soft skills result:', safeResult);
    return safeResult;
    
  } catch (error) {
    console.error('💥 Soft skills analysis failed completely:', error);
    throw error; // Re-throw to propagate the error up
  }
};

const analyzeConsistencyWithGroq = async (resumeText: string, apiKey: string) => {
  const messages = [
    {
      role: 'system',
      content: `Analyze the resume for consistency issues in formatting, dates, and language.

Return ONLY a JSON object (no markdown, no explanations):
{
  "dateFormatIssues": ["issue1", "issue2"],
  "tenseIssues": ["issue1", "issue2"],
  "formattingIssues": ["issue1", "issue2"],
  "score": 85
}`
    },
    {
      role: 'user',
      content: `Check consistency in this resume:\n\n${resumeText}`
    }
  ];

  try {
    const response = await makeGroqRequest(messages, apiKey);
    console.log('Consistency analysis raw response:', response);
    
    const fallback = {
      dateFormatIssues: [],
      tenseIssues: [],
      formattingIssues: [],
      score: 100
    };

    const validator = (obj: any) => {
      return Array.isArray(obj.dateFormatIssues) && 
             Array.isArray(obj.tenseIssues) && 
             Array.isArray(obj.formattingIssues) && 
             typeof obj.score === 'number';
    };

    return parseWithFallback(response, fallback, validator);
  } catch (error) {
    console.error('Consistency analysis failed:', error);
    throw error; // Re-throw to propagate the error up
  }
};

// Enhanced summary generation with mood awareness
const generateMoodAwareSummary = async (resumeText: string, roleAnalysis: any, seniorityAnalysis: any, extractedSkills: string[], apiKey: string, mood: AnalysisMood): Promise<string> => {
  const messages = [
    {
      role: 'system',
      content: `You are a resume analysis expert. Create a comprehensive 5-6 line summary of the candidate based on their resume.

CRITICAL: Return ONLY the summary text, no JSON, no markdown, no explanations.

The summary should include:
- Professional background and role
- Years of experience and seniority level
- Key skills and expertise areas
- Notable achievements or strengths
- Overall career trajectory
- Industry focus

Keep it factual, comprehensive, and professional regardless of the requested tone.`
    },
    {
      role: 'user',
      content: `Create a detailed summary for this candidate:

RESUME TEXT:
${resumeText}

DETECTED ROLE: ${roleAnalysis.detectedRole || 'Professional'}
SENIORITY: ${seniorityAnalysis.level || 'Mid-level'} (${seniorityAnalysis.yearsExperience || 'several'} years)
KEY SKILLS: ${extractedSkills.slice(0, 8).join(', ')}

Write a comprehensive 5-6 line summary covering their background, experience, skills, and career focus.`
    }
  ];

  try {
    const response = await makeGroqRequest(messages, apiKey);
    console.log('Summary generation raw response:', response);
    
    // Clean up the response to extract just the summary
    const cleanSummary = response
      .replace(/```.*?```/gs, '') // Remove code blocks
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
      .trim();
    
    return cleanSummary || `${seniorityAnalysis.level || 'Professional'} ${roleAnalysis.detectedRole || 'candidate'} with ${seniorityAnalysis.yearsExperience || 'several'} years of experience in ${extractedSkills.slice(0, 3).join(', ')} and related technologies.`;
  } catch (error) {
    console.error('Summary generation failed:', error);
    return `${seniorityAnalysis.level || 'Professional'} ${roleAnalysis.detectedRole || 'candidate'} with ${seniorityAnalysis.yearsExperience || 'several'} years of experience in ${extractedSkills.slice(0, 3).join(', ')} and related technologies.`;
  }
};

export class HuggingFaceService {
  constructor(private apiKey: string) {
    console.log('🔧 HuggingFaceService initialized with API key length:', apiKey.length);
  }

  async analyzeResume(file: File, mood: AnalysisMood = 'professional'): Promise<AnalysisResult> {
    console.log('=== STARTING RESUME ANALYSIS ===');
    console.log('File name:', file.name);
    console.log('File size:', file.size);
    console.log('File type:', file.type);
    console.log('Analysis mood:', mood);
    console.log('Using API key length:', this.apiKey.length);
    
    // Extract text using the new ResumeParser
    const resumeText = await ResumeParser.extractText(file);
    
    console.log('=== EXTRACTED RESUME TEXT ===');
    console.log('Length:', resumeText.length);
    console.log('First 1000 characters:');
    console.log(resumeText.substring(0, 1000));
    console.log('=== END EXTRACTED TEXT ===');

    if (!resumeText || resumeText.trim().length < 50) {
      throw new Error('Resume text is too short or empty. Please ensure the file contains readable text.');
    }

    try {
      console.log('Starting parallel analysis...');
      
      const [
        roleAnalysis,
        extractedSkills,
        seniorityAnalysis,
        quantificationAnalysis,
        actionVerbAnalysis,
        softSkillsAnalysis,
        consistencyAnalysis
      ] = await Promise.all([
        analyzeRoleWithGroq(resumeText, this.apiKey),
        extractSkillsWithGroq(resumeText, this.apiKey),
        analyzeSeniorityWithGroq(resumeText, this.apiKey),
        analyzeQuantificationWithGroq(resumeText, this.apiKey),
        analyzeActionVerbsWithGroq(resumeText, this.apiKey),
        analyzeSoftSkillsWithGroq(resumeText, this.apiKey),
        analyzeConsistencyWithGroq(resumeText, this.apiKey)
      ]);

      // Generate comprehensive summary
      const comprehensiveSummary = await generateMoodAwareSummary(
        resumeText, 
        roleAnalysis, 
        seniorityAnalysis, 
        extractedSkills, 
        this.apiKey, 
        mood
      );

      console.log('=== ANALYSIS RESULTS ===');
      console.log('Role Analysis:', roleAnalysis);
      console.log('Extracted Skills:', extractedSkills);
      console.log('Seniority Analysis:', seniorityAnalysis);
      console.log('Soft Skills Analysis:', softSkillsAnalysis);
      console.log('Generated Summary:', comprehensiveSummary);
      console.log('=== END ANALYSIS RESULTS ===');

      // Calculate detailed scores
      const detailedScores = {
        contactInformation: 85, // Mock for now
        workExperience: 80,
        education: 75,
        skills: extractedSkills.length > 0 ? 90 : 20,
        formatting: 85,
        quantification: quantificationAnalysis.score,
        actionVerbs: actionVerbAnalysis.score,
        consistency: consistencyAnalysis.score,
      };

      const overallScore = Math.round(
        Object.values(detailedScores).reduce((sum, score) => sum + score, 0) / 
        Object.values(detailedScores).length
      );

      const result: AnalysisResult = {
        overallScore,
        detailedScores,
        strengths: [
          `Strong ${roleAnalysis.detectedRole || 'professional'} background`,
          `${extractedSkills.length} technical skills identified`,
          `${seniorityAnalysis.level || 'Professional'} level experience`
        ],
        improvements: [
          'Consider adding more quantified achievements',
          'Strengthen action verbs in job descriptions',
          'Ensure consistent formatting throughout'
        ],
        extractedSkills,
        summary: comprehensiveSummary,
        
        quantificationAnalysis,
        actionVerbAnalysis,
        redundancyAnalysis: {
          repeatedPhrases: [],
          duplicatedAchievements: [],
          score: 85
        },
        softSkillsInference: softSkillsAnalysis,
        consistencyCheck: consistencyAnalysis,
        sectionOrdering: {
          currentOrder: ['Contact', 'Experience', 'Skills', 'Education'],
          recommendedOrder: ['Contact', 'Summary', 'Experience', 'Skills', 'Education'],
          issues: [],
          score: 90
        },
        timelineAnalysis: {
          gaps: [],
          score: 95
        },
        roleAlignment: {
          detectedRole: roleAnalysis.detectedRole || 'Unknown',
          confidence: roleAnalysis.confidence || 0,
          alternativeRoles: roleAnalysis.alternativeRoles || []
        },
        seniorityEstimation: {
          level: seniorityAnalysis.level || 'Unknown',
          confidence: seniorityAnalysis.confidence || 0,
          indicators: seniorityAnalysis.indicators || []
        },
        industryDetection: {
          primaryIndustry: 'Technology',
          secondaryIndustries: ['Software Development'],
          confidence: 80
        },
        keywordSuggestions: [],
        impactOptimization: [],
        lengthOptimization: {
          currentLength: resumeText.length,
          recommendedLength: 2000,
          suggestions: []
        },
        missingSections: [],
        piiDetected: {
          emails: [],
          phones: [],
          addresses: [],
          socialMedia: []
        }
      };

      console.log('=== FINAL RESULT ===');
      console.log('Overall Score:', result.overallScore);
      console.log('Detected Role:', result.roleAlignment.detectedRole);
      console.log('Seniority Level:', result.seniorityEstimation.level);
      console.log('Skills Count:', result.extractedSkills.length);
      console.log('Soft Skills:', result.softSkillsInference);
      console.log('=== END FINAL RESULT ===');

      // Apply mood-specific transformations
      const moodResult = MoodAnalyzer.applyMoodToAnalysis(result, mood);
      
      console.log('=== MOOD-ENHANCED RESULT ===');
      console.log('Applied mood:', mood);
      console.log('Mood-specific summary:', moodResult.moodSpecificSummary);
      console.log('=== END MOOD-ENHANCED RESULT ===');

      return moodResult;
    } catch (error) {
      console.error('Resume analysis failed:', error);
      throw error; // Re-throw the original error to preserve the specific error message
    }
  }

  async compareWithJobDescription(
    resumeText: string,
    jobDescription: string
  ): Promise<JobDescriptionMatch> {
    return compareWithJobDescriptionGroq(resumeText, jobDescription, this.apiKey);
  }
}

const compareWithJobDescriptionGroq = async (
  resumeText: string,
  jobDescription: string,
  apiKey: string
): Promise<JobDescriptionMatch> => {
  const messages = [
    {
      role: 'system',
      content: `You are a resume-job matching expert. Compare the resume with the job description and provide a detailed match analysis.

Return ONLY a JSON object (no markdown, no explanations):
{
  "overallMatch": 75,
  "skillsMatch": 80,
  "experienceMatch": 70,
  "missingSkills": ["skill1", "skill2"],
  "matchingSkills": ["skill1", "skill2"],
  "recommendations": ["rec1", "rec2"]
}`
    },
    {
      role: 'user',
      content: `Compare this resume with the job description:

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`
    }
  ];

  try {
    const response = await makeGroqRequest(messages, apiKey);
    console.log('Job matching raw response:', response);
    
    const fallback = {
      overallMatch: 0,
      skillsMatch: 0,
      experienceMatch: 0,
      missingSkills: [],
      matchingSkills: [],
      recommendations: ['Analysis failed - please try again']
    };

    const validator = (obj: any) => {
      return typeof obj.overallMatch === 'number' &&
             typeof obj.skillsMatch === 'number' &&
             typeof obj.experienceMatch === 'number' &&
             Array.isArray(obj.missingSkills) &&
             Array.isArray(obj.matchingSkills) &&
             Array.isArray(obj.recommendations);
    };

    return parseWithFallback(response, fallback, validator);
  } catch (error) {
    console.error('Job description comparison failed:', error);
    throw error; // Re-throw to propagate the error up
  }
};

// Legacy exports for backward compatibility
export const analyzeResume = async (file: File, apiKey: string, mood: AnalysisMood = 'professional'): Promise<AnalysisResult> => {
  const service = new HuggingFaceService(apiKey);
  return service.analyzeResume(file, mood);
};

export const compareWithJobDescription = async (
  resumeText: string,
  jobDescription: string,
  apiKey: string
): Promise<JobDescriptionMatch> => {
  const service = new HuggingFaceService(apiKey);
  return service.compareWithJobDescription(resumeText, jobDescription);
};