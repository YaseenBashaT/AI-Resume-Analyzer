# AI Resume Analyzer

A powerful AI-driven resume analysis tool that provides comprehensive feedback and insights using advanced language models.

## Features

- **Lightning-fast AI Analysis** using Groq's optimized inference infrastructure
- **Multiple Analysis Moods** (Professional, Brutal, Soft, Witty, Motivational)
- **Comprehensive Scoring** across multiple resume dimensions
- **Skills Extraction** and role detection
- **Contact Information** extraction and validation
- **File Format Support** (PDF, DOC, DOCX, TXT)
- **Real-time Mood Switching** without re-analysis

## Setup

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Groq API Configuration
VITE_GROQ_API_KEY=your_groq_api_key_here

# Model Configuration (optional)
VITE_GROQ_MODEL=llama-3.1-8b-instant

# Application Configuration (optional)
VITE_APP_NAME=AI Resume Analyzer
```

### Getting a Groq API Key

1. Visit [Groq Console](https://console.groq.com/keys)
2. Sign up or log in to your account
3. Create a new API key
4. Copy the key and add it to your `.env` file

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

1. **Upload Resume**: Drag and drop or click to upload your resume (PDF, DOC, DOCX, or TXT)
2. **Select Analysis Mood**: Choose your preferred feedback style
3. **Get Instant Results**: View comprehensive analysis with actionable insights
4. **Switch Moods**: Change feedback tone instantly without re-analyzing

## Supported File Formats

- **PDF**: Full text extraction with advanced parsing
- **Microsoft Word**: DOC and DOCX formats
- **Plain Text**: TXT files
- **Contact Info Detection**: Automatic extraction of emails, phones, addresses

## Analysis Features

### Core Analysis
- Overall resume scoring
- Section-by-section breakdown
- Skills extraction and categorization
- Role and seniority detection
- Industry alignment assessment

### Advanced Features
- Quantification analysis (metrics and achievements)
- Action verb strength assessment
- Soft skills inference
- Consistency checking
- Timeline gap detection
- ATS optimization suggestions

### Mood Variations
- **Professional**: Clean, structured, corporate feedback
- **Brutal**: Direct, unfiltered, no-nonsense critique
- **Soft**: Kind, encouraging, gently worded guidance
- **Witty**: Fun, humorous, sarcastic but truthful
- **Motivational**: Coach-like, inspiring, energetic feedback

## Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **AI Model**: LLaMA 3.1 8B Instant via Groq API
- **File Processing**: PDF.js, Mammoth.js
- **Icons**: Lucide React
- **Build Tool**: Vite

## API Configuration

The application supports both:
- **Default API**: Pre-configured Groq integration
- **Custom API**: Use your own Groq API key for unlimited access

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues or questions:
- Check the console for detailed error messages
- Ensure your API key is valid and has sufficient credits
- Verify file formats are supported
- Contact support if problems persist