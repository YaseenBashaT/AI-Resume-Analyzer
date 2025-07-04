import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { getDocument } from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';

// Configure PDF.js worker using local worker file for WebContainer compatibility
pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

// Debug log to verify worker setup
console.log("✅ PDF.js worker set:", pdfjsLib.GlobalWorkerOptions.workerSrc);

export interface ParsedResume {
  sections: {
    contactInfo: string;
    summary: string;
    experience: string;
    education: string;
    skills: string;
    projects: string;
    certifications: string;
    other: string;
  };
  cleanText: string;
  metadata: {
    originalLength: number;
    cleanedLength: number;
    sectionsFound: string[];
    hasStructure: boolean;
  };
}

/**
 * Intelligently extract and parse resume content from various file formats
 */
export class ResumeParser {
  private static readonly SECTION_PATTERNS = {
    contactInfo: /^(contact|personal|info|details|profile)$/i,
    summary: /^(summary|profile|objective|about|overview|professional\s+summary)$/i,
    experience: /^(experience|work|employment|career|professional\s+experience|work\s+history)$/i,
    education: /^(education|academic|qualifications|degrees?)$/i,
    skills: /^(skills|technical|competencies|expertise|technologies|tools)$/i,
    projects: /^(projects?|portfolio|work\s+samples?)$/i,
    certifications: /^(certifications?|certificates?|licenses?|credentials?)$/i,
  };

  private static readonly BULLET_PATTERNS = [
    /^[\s]*[•▪▫‣⁃◦▸▹▶►‣]\s*/,
    /^[\s]*[-*+]\s*/,
    /^[\s]*\d+\.\s*/,
    /^[\s]*[a-zA-Z]\.\s*/,
    /^[\s]*[ivxlcdm]+\.\s*/i,
  ];

  /**
   * Extract text from file based on type
   */
  static async extractText(file: File): Promise<string> {
    console.log(`🔍 Extracting text from ${file.type} file: ${file.name}`);
    console.log(`📁 File size: ${file.size} bytes`);
    
    try {
      let extractedText = '';
      
      // Handle different file types
      if (file.type === 'application/pdf') {
        console.log('📄 Processing PDF file...');
        extractedText = await this.extractFromPDF(file);
      } else if (
        file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.type === 'application/msword' ||
        file.name.toLowerCase().endsWith('.docx') ||
        file.name.toLowerCase().endsWith('.doc')
      ) {
        console.log('📝 Processing Word document...');
        extractedText = await this.extractFromWord(file);
      } else if (
        file.type === 'text/plain' ||
        file.name.toLowerCase().endsWith('.txt')
      ) {
        console.log('📄 Processing text file...');
        extractedText = await this.extractFromText(file);
      } else {
        console.log('❓ Unknown file type, attempting text extraction...');
        extractedText = await this.extractFromText(file);
      }

      // Validate extracted text
      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error(`Resume text is too short or empty. Please ensure your resume contains sufficient readable content. Current length: ${extractedText?.trim().length || 0} characters.`);
      }

      console.log(`✅ Successfully extracted ${extractedText.length} characters from ${file.name}`);
      console.log(`📝 First 200 characters: ${extractedText.substring(0, 200)}...`);
      
      return extractedText;
      
    } catch (error) {
      console.error('❌ Text extraction failed:', error);
      
      // Provide specific error messages based on the type of failure
      if (error instanceof Error) {
        if (error.message.includes('PDF extraction failed')) {
          throw new Error(`PDF processing failed: ${error.message}\n\nTip: Try uploading your resume as a Word document (.docx) instead.`);
        } else if (error.message.includes('Word document extraction failed')) {
          throw new Error(`Word document processing failed: ${error.message}\n\nTip: Try uploading your resume as a PDF or plain text file instead.`);
        } else if (error.message.includes('too short') || error.message.includes('empty')) {
          throw new Error(`${error.message}\n\nPlease ensure your resume:\n• Contains readable text (not just images)\n• Is not password-protected\n• Has sufficient content to analyze`);
        }
        throw error;
      }
      
      throw new Error('Resume analysis failed due to an unexpected error. Please try again with a different file format.');
    }
  }

  /**
   * Extract text from PDF using pdfjs-dist with local worker
   */
  private static async extractFromPDF(file: File): Promise<string> {
    try {
      console.log('🔧 Initializing PDF processing with local worker:', pdfjsLib.GlobalWorkerOptions.workerSrc);
      const arrayBuffer = await file.arrayBuffer();
      console.log(`📊 PDF buffer size: ${arrayBuffer.byteLength} bytes`);
      
      const pdf = await getDocument({ 
        data: arrayBuffer,
        verbosity: 0
      }).promise;
      console.log(`📄 PDF loaded: ${pdf.numPages} pages`);
      
      let fullText = '';
      
      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        console.log(`📖 Processing page ${pageNum}/${pdf.numPages}...`);
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine text items from the page
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        
        fullText += pageText + '\n';
        console.log(`📝 Page ${pageNum} extracted: ${pageText.length} characters`);
      }
      
      if (!fullText.trim()) {
        throw new Error('PDF appears to contain no readable text. It may be image-based or corrupted.');
      }
      
      console.log(`✅ PDF extraction complete: ${fullText.length} characters from ${pdf.numPages} pages`);
      return fullText;
      
    } catch (error) {
      console.error('❌ PDF extraction error:', error);
      
      if (error instanceof Error && error.message.includes('Invalid PDF')) {
        throw new Error('Invalid or corrupted PDF file. Please try a different file.');
      }
      throw new Error(`PDF extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from Word document using mammoth
   */
  private static async extractFromWord(file: File): Promise<string> {
    try {
      console.log('🔧 Initializing Word document processing...');
      const arrayBuffer = await file.arrayBuffer();
      console.log(`📊 Word document buffer size: ${arrayBuffer.byteLength} bytes`);
      
      const result = await mammoth.extractRawText({ arrayBuffer });
      console.log(`📝 Mammoth extraction result: ${result.value.length} characters`);
      
      if (result.messages && result.messages.length > 0) {
        console.warn('⚠️ Word extraction warnings:', result.messages);
      }
      
      if (!result.value.trim()) {
        throw new Error('Word document appears to contain no readable text. The document may be empty or contain only images.');
      }
      
      console.log(`✅ Word document extraction complete: ${result.value.length} characters`);
      return result.value;
      
    } catch (error) {
      console.error('❌ Word document extraction error:', error);
      if (error instanceof Error) {
        if (error.message.includes('ENOENT') || error.message.includes('not supported')) {
          throw new Error('Word document format not supported or file is corrupted. Please try saving as a newer .docx format.');
        }
        throw new Error(`Word document extraction failed: ${error.message}`);
      }
      throw new Error('Word document extraction failed: Unknown error');
    }
  }

  /**
   * Extract text from plain text file
   */
  private static async extractFromText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      console.log('🔧 Reading text file...');
      const reader = new FileReader();
      
      reader.onload = (event) => {
        const text = event.target?.result as string;
        
        if (!text || text.trim().length === 0) {
          reject(new Error('Text file is empty or contains no readable content.'));
          return;
        }
        
        console.log(`✅ Text file extraction complete: ${text.length} characters`);
        resolve(text);
      };
      
      reader.onerror = () => {
        console.error('❌ Text file reading error');
        reject(new Error('Failed to read text file. The file may be corrupted.'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Parse and structure the extracted resume text
   */
  static parseResume(rawText: string): ParsedResume {
    console.log('🧹 Starting intelligent resume parsing...');
    console.log(`📊 Raw text length: ${rawText.length} characters`);

    // Validate input
    if (!rawText || rawText.trim().length < 50) {
      throw new Error('Resume text is too short or empty. Please ensure your resume contains sufficient content.');
    }

    // Step 1: Clean and normalize the text
    const normalizedText = this.normalizeText(rawText);
    console.log(`✨ Normalized text length: ${normalizedText.length} characters`);

    // Step 2: Detect and extract sections
    const sections = this.extractSections(normalizedText);
    const foundSections = Object.keys(sections).filter(key => sections[key as keyof typeof sections].trim());
    console.log(`📋 Sections found: ${foundSections.length} (${foundSections.join(', ')})`);

    // Step 3: Create clean, structured text
    const cleanText = this.createStructuredText(sections);
    console.log(`🎯 Final clean text length: ${cleanText.length} characters`);

    const metadata = {
      originalLength: rawText.length,
      cleanedLength: cleanText.length,
      sectionsFound: foundSections,
      hasStructure: foundSections.length > 0
    };

    console.log('✅ Resume parsing complete:', metadata);

    return {
      sections,
      cleanText,
      metadata
    };
  }

  /**
   * Normalize text by fixing common issues
   */
  private static normalizeText(text: string): string {
    let normalized = text;

    // Remove excessive whitespace and normalize line breaks
    normalized = normalized.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Fix broken lines (merge lines that should be together)
    normalized = normalized.replace(/([a-z,])\n([a-z])/g, '$1 $2');
    
    // Normalize bullet points
    for (const pattern of this.BULLET_PATTERNS) {
      normalized = normalized.replace(new RegExp(pattern.source, 'gm'), '- ');
    }
    
    // Remove excessive blank lines
    normalized = normalized.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Remove page numbers and common junk
    normalized = normalized.replace(/^Page \d+.*$/gm, '');
    normalized = normalized.replace(/^\d+\s*$/gm, '');
    
    // Clean up spacing
    normalized = normalized.replace(/[ \t]+/g, ' ');
    normalized = normalized.replace(/\n /g, '\n');
    
    return normalized.trim();
  }

  /**
   * Extract sections from normalized text
   */
  private static extractSections(text: string): ParsedResume['sections'] {
    const sections: ParsedResume['sections'] = {
      contactInfo: '',
      summary: '',
      experience: '',
      education: '',
      skills: '',
      projects: '',
      certifications: '',
      other: ''
    };

    const lines = text.split('\n');
    let currentSection = 'other';
    let currentContent: string[] = [];

    // First, try to extract contact info from the top
    const topLines = lines.slice(0, 10);
    const contactLines = topLines.filter(line => 
      /[@.]/.test(line) || // Email or website
      /\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(line) || // Phone
      /linkedin|github|portfolio/i.test(line) // Social links
    );
    
    if (contactLines.length > 0) {
      sections.contactInfo = contactLines.join('\n');
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) continue;

      // Check if this line is a section header
      const detectedSection = this.detectSectionHeader(line);
      
      if (detectedSection) {
        // Save previous section content
        if (currentContent.length > 0) {
          sections[currentSection as keyof ParsedResume['sections']] += 
            (sections[currentSection as keyof ParsedResume['sections']] ? '\n\n' : '') + 
            currentContent.join('\n');
        }
        
        // Start new section
        currentSection = detectedSection;
        currentContent = [];
      } else {
        // Add line to current section
        currentContent.push(line);
      }
    }

    // Don't forget the last section
    if (currentContent.length > 0) {
      sections[currentSection as keyof ParsedResume['sections']] += 
        (sections[currentSection as keyof ParsedResume['sections']] ? '\n\n' : '') + 
        currentContent.join('\n');
    }

    return sections;
  }

  /**
   * Detect if a line is a section header
   */
  private static detectSectionHeader(line: string): keyof ParsedResume['sections'] | null {
    const cleanLine = line.replace(/[^\w\s]/g, '').trim();
    
    for (const [section, pattern] of Object.entries(this.SECTION_PATTERNS)) {
      if (pattern.test(cleanLine)) {
        return section as keyof ParsedResume['sections'];
      }
    }
    
    return null;
  }

  /**
   * Create structured text from sections
   */
  private static createStructuredText(sections: ParsedResume['sections']): string {
    const structuredParts: string[] = [];

    // Add sections in logical order
    const sectionOrder: (keyof ParsedResume['sections'])[] = [
      'contactInfo',
      'summary', 
      'experience',
      'skills',
      'education',
      'projects',
      'certifications',
      'other'
    ];

    for (const sectionKey of sectionOrder) {
      const content = sections[sectionKey].trim();
      if (content) {
        const sectionTitle = sectionKey.replace(/([A-Z])/g, ' $1').trim().toUpperCase();
        structuredParts.push(`=== ${sectionTitle} ===\n${content}`);
      }
    }

    return structuredParts.join('\n\n');
  }

  /**
   * Validate that the parsed resume has meaningful content
   */
  static validateParsedResume(parsed: ParsedResume): { isValid: boolean; issues: string[] } {
    const issues: string[] = [];
    
    if (parsed.cleanText.length < 50) {
      issues.push('Resume text is too short (less than 50 characters)');
    }
    
    if (!parsed.metadata.hasStructure) {
      issues.push('No clear sections detected in resume');
    }
    
    if (!parsed.sections.experience.trim() && !parsed.sections.skills.trim()) {
      issues.push('No work experience or skills section found');
    }
    
    // Check for common extraction failures
    if (parsed.cleanText.includes('�') || parsed.cleanText.includes('□')) {
      issues.push('Text extraction may have encoding issues');
    }
    
    return {
      isValid: issues.length === 0,
      issues
    };
  }
}