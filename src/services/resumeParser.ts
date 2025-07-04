import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import { getDocument } from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
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
        throw new Error(`We couldn't read text from your resume. Try uploading a higher-quality scan or export your PDF from a text editor (like Word or Google Docs). Current length: ${extractedText?.trim().length || 0} characters.`);
      }

      console.log(`✅ Successfully extracted ${extractedText.length} characters from ${file.name}`);
      console.log(`📝 First 200 characters: ${extractedText.substring(0, 200)}...`);
      
      return extractedText;
      
    } catch (error) {
      console.error('❌ Text extraction failed:', error);
      
      // Provide specific error messages based on the type of failure
      if (error instanceof Error) {
        if (error.message.includes('PDF extraction failed')) {
          throw new Error(`PDF processing failed: ${error.message}`);
        } else if (error.message.includes('Word document extraction failed')) {
          throw new Error(`Word document processing failed: ${error.message}`);
        } else if (error.message.includes('couldn\'t read text')) {
          throw error; // Pass through the improved error message
        }
        throw error;
      }
      
      throw new Error('Resume analysis failed due to an unexpected error. Please try again with a different file format.');
    }
  }

  /**
   * Improved PDF extraction with OCR fallback
   */
  private static async extractFromPDF(file: File): Promise<string> {
    try {
      console.log('🔧 Starting PDF text extraction...');
      const buffer = await file.arrayBuffer();
      console.log(`📊 PDF buffer size: ${buffer.byteLength} bytes`);
      
      // Clone buffer to prevent detachment issues
      const safeBuffer = new Uint8Array(buffer);
      
      const pdf = await getDocument({ data: safeBuffer }).promise;
      console.log(`📄 PDF loaded: ${pdf.numPages} pages`);
      
      let text = '';

      // Extract text from all pages
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`📖 Processing page ${i}/${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        
        // Extract only meaningful text, ignore images and graphics
        const pageText = content.items
          .filter((item: any) => item.str && typeof item.str === 'string' && item.str.trim().length > 0)
          .map((item: any) => item.str)
          .join(' ') + '\n';
        
        text += pageText;
        console.log(`📝 Page ${i} extracted: ${pageText.length} characters`);
      }

      // Clean up extracted text
      text = this.cleanExtractedText(text);
      console.log(`📊 Total extracted text length: ${text.length} characters`);

      // 🛡️ Fallback if text is empty or too short
      if (text.trim().length < 30) {
        console.warn('🔁 No readable text found, switching to OCR...');
        return await this.extractTextWithOCR(buffer);
      }

      console.log(`✅ PDF text extraction successful: ${text.length} characters`);
      return text;
      
    } catch (err) {
      console.error('❌ PDF extraction error:', err);
      throw new Error('PDF processing failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }

  /**
   * OCR extraction for image-based PDFs
   */
  private static async extractTextWithOCR(buffer: ArrayBuffer): Promise<string> {
    try {
      console.log('🔍 Starting OCR extraction...');
      
      // Validate buffer
      if (!buffer || buffer.byteLength === 0) {
        throw new Error("Buffer is empty or undefined.");
      }

      // Convert PDF pages to images and extract text
      const imageDataUrl = await this.convertPdfPageToImage(buffer);
      
      // Create Tesseract worker
      console.log('🤖 Initializing OCR worker...');
      const worker = await createWorker('eng');
      
      // Perform OCR
      console.log('🔍 Running OCR on PDF content...');
      const { data: { text } } = await worker.recognize(imageDataUrl);
      
      // Clean up worker
      await worker.terminate();
      
      // Clean OCR text
      const cleanedText = this.cleanOCRText(text);
      
      console.log(`✅ OCR extraction complete: ${cleanedText.length} characters`);
      return cleanedText;
      
    } catch (err) {
      console.error('❌ OCR extraction failed:', err);
      throw new Error('OCR extraction failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  }

  /**
   * Convert PDF page to image for OCR
   */
  private static async convertPdfPageToImage(buffer: ArrayBuffer): Promise<string> {
    try {
      console.log('🖼️ Converting PDF page to image...');
      
      // Use fresh buffer to avoid detachment
      const safeBuffer = new Uint8Array(buffer);
      const pdf = await getDocument({ data: safeBuffer }).promise;
      const page = await pdf.getPage(1); // Convert first page only for performance
      
      // Set up viewport with higher scale for better OCR
      const viewport = page.getViewport({ scale: 2.0 });
      
      // Create canvas
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      if (!context) {
        throw new Error('Could not get canvas context');
      }
      
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Render PDF page to canvas
      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      
      await page.render(renderContext).promise;
      
      // Convert to base64 image
      const imageDataUrl = canvas.toDataURL('image/png');
      console.log('✅ PDF page converted to image successfully');
      
      return imageDataUrl;
      
    } catch (error) {
      console.error('❌ PDF to image conversion failed:', error);
      throw new Error('Failed to convert PDF page to image: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }

  /**
   * Clean OCR-extracted text
   */
  private static cleanOCRText(text: string): string {
    let cleaned = text;
    
    // Fix common OCR errors
    cleaned = cleaned.replace(/[|]/g, 'I'); // Common OCR mistake
    cleaned = cleaned.replace(/(\w)[0](\w)/g, '$1O$2'); // Zero to O in words
    cleaned = cleaned.replace(/(\w)[1](\w)/g, '$1l$2'); // 1 to l in words
    cleaned = cleaned.replace(/(\w)[5](\w)/g, '$1S$2'); // 5 to S in words
    
    // Remove excessive whitespace
    cleaned = cleaned.replace(/\s+/g, ' ');
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Remove lines that are likely OCR artifacts
    const lines = cleaned.split('\n');
    const filteredLines = lines.filter(line => {
      const trimmed = line.trim();
      return trimmed.length > 0 && 
             !trimmed.match(/^[^\w\s]*$/) && // Not just symbols
             !trimmed.match(/^[A-Z\s]{1,3}$/) && // Not just 1-3 capital letters
             trimmed.length < 200; // Not extremely long (likely corrupted)
    });
    
    cleaned = filteredLines.join('\n').trim();
    
    return cleaned;
  }

  /**
   * Clean extracted text from any remaining artifacts
   */
  private static cleanExtractedText(text: string): string {
    let cleaned = text;
    
    // Remove page numbers and headers/footers that appear multiple times
    const lines = cleaned.split('\n');
    const lineFrequency = new Map<string, number>();
    
    // Count frequency of each line to identify headers/footers
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.length > 0 && trimmed.length < 100) { // Only check short lines
        lineFrequency.set(trimmed, (lineFrequency.get(trimmed) || 0) + 1);
      }
    });
    
    // Remove lines that appear too frequently (likely headers/footers)
    const filteredLines = lines.filter(line => {
      const trimmed = line.trim();
      const frequency = lineFrequency.get(trimmed) || 0;
      
      // Remove if it appears more than 2 times and looks like header/footer
      if (frequency > 2 && (
        /^page\s+\d+/i.test(trimmed) || // Page numbers
        /^\d+$/.test(trimmed) || // Standalone numbers
        /^confidential/i.test(trimmed) || // Confidential headers
        trimmed.length < 5 // Very short repeated text
      )) {
        return false;
      }
      
      return true;
    });
    
    cleaned = filteredLines.join('\n');
    
    // Remove excessive whitespace and normalize
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n'); // Max 2 consecutive newlines
    cleaned = cleaned.replace(/[ \t]+/g, ' '); // Normalize spaces
    cleaned = cleaned.replace(/^\s+|\s+$/gm, ''); // Trim each line
    
    // Remove common PDF artifacts
    cleaned = cleaned.replace(/\f/g, ''); // Form feed characters
    cleaned = cleaned.replace(/\r/g, ''); // Carriage returns
    
    return cleaned.trim();
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

    // Enhanced contact info extraction from the top of the resume
    const topLines = lines.slice(0, 20);
    const contactLines = topLines.filter(line => {
      const cleanLine = line.trim();
      return (
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(cleanLine) || // Email
        /\b\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/.test(cleanLine) || // US Phone
        /\b(\+\d{1,3}[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/.test(cleanLine) || // International Phone
        /\b\+?[\d\s\-\(\)]{10,15}\b/.test(cleanLine) || // General phone pattern
        /linkedin\.com|github\.com|portfolio|website/i.test(cleanLine) || // Social links
        /\b(www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\b/.test(cleanLine) || // Website URLs
        /\b\d{1,5}\s+\w+\s+(street|st|avenue|ave|road|rd|drive|dr|lane|ln|boulevard|blvd)/i.test(cleanLine) || // Address
        /\b[A-Z][a-z]+,\s*[A-Z]{2}\s*\d{5}/.test(cleanLine) || // City, State ZIP
        /\b[A-Z][a-z]+\s*,\s*[A-Z][a-z]+\s*,?\s*[A-Z]{2,3}\s*\d{5}/.test(cleanLine) // City, State, Country ZIP
      );
    });
    
    // Also include name-like patterns from the very top
    const namePattern = /^[A-Z][a-z]+(\s+[A-Z]\.?)?\s+[A-Z][a-z]+(\s+[A-Z][a-z]+)?$/;
    const potentialName = topLines.slice(0, 3).find(line => namePattern.test(line.trim()));
    
    if (potentialName) {
      contactLines.unshift(potentialName.trim());
    }
    
    // Look for professional titles near the top
    const titlePattern = /(software|web|mobile|frontend|backend|full.?stack|data|senior|junior|lead|principal|architect|engineer|developer|designer|analyst|manager|director)/i;
    const potentialTitle = topLines.slice(0, 5).find(line => {
      const cleanLine = line.trim();
      return titlePattern.test(cleanLine) && 
             cleanLine.length < 100 && 
             !namePattern.test(cleanLine) &&
             !contactLines.includes(cleanLine);
    });
    
    if (potentialTitle) {
      contactLines.push(potentialTitle.trim());
    }
    
    if (contactLines.length > 0) {
      sections.contactInfo = [...new Set(contactLines)].join('\n'); // Remove duplicates
    }

    // Enhanced summary detection - look for summary-like content early in the resume
    const summaryLines = topLines.slice(contactLines.length > 0 ? contactLines.length : 0, 20);
    const summaryContent = summaryLines.filter(line => {
      const cleanLine = line.trim();
      return cleanLine.length > 30 && // Substantial content
             !namePattern.test(cleanLine) && // Not a name
             !/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/.test(cleanLine) && // Not email
             !/\b\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/.test(cleanLine) && // Not phone
             /[.!?]$/.test(cleanLine); // Ends with sentence punctuation
    });
    
    if (summaryContent.length > 0) {
      sections.summary = summaryContent.slice(0, 3).join(' '); // Take first few sentences
    }

    // Process remaining lines for other sections
    const remainingLines = lines.slice(Math.max(contactLines.length, summaryContent.length));
    
    for (let i = 0; i < remainingLines.length; i++) {
      const line = remainingLines[i].trim();
      
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