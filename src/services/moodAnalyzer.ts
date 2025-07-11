import type { AnalysisResult } from '../types/analysis';
import type { AnalysisMood } from '../components/MoodSelector';

export class MoodAnalyzer {
  static applyMoodToAnalysis(result: AnalysisResult, mood: AnalysisMood): AnalysisResult {
    const moodResult = { ...result, mood };
    
    // Apply mood-specific transformations
    switch (mood) {
      case 'brutal':
        return this.applyBrutalMood(moodResult);
      case 'soft':
        return this.applySoftMood(moodResult);
      case 'professional':
        return this.applyProfessionalMood(moodResult);
      case 'witty':
        return this.applyWittyMood(moodResult);
      case 'motivational':
        return this.applyMotivationalMood(moodResult);
      default:
        return moodResult;
    }
  }

  private static applyBrutalMood(result: AnalysisResult): AnalysisResult {
    return {
      ...result,
      moodSpecificSummary: this.transformSummaryBrutal(result.summary),
      moodSpecificStrengths: result.strengths.map(this.transformStrengthBrutal),
      moodSpecificImprovements: result.improvements.map(this.transformImprovementBrutal)
    };
  }

  private static applySoftMood(result: AnalysisResult): AnalysisResult {
    return {
      ...result,
      moodSpecificSummary: this.transformSummarySoft(result.summary),
      moodSpecificStrengths: result.strengths.map(this.transformStrengthSoft),
      moodSpecificImprovements: result.improvements.map(this.transformImprovementSoft)
    };
  }

  private static applyProfessionalMood(result: AnalysisResult): AnalysisResult {
    return {
      ...result,
      moodSpecificSummary: this.transformSummaryProfessional(result.summary),
      moodSpecificStrengths: result.strengths.map(this.transformStrengthProfessional),
      moodSpecificImprovements: result.improvements.map(this.transformImprovementProfessional)
    };
  }

  private static applyWittyMood(result: AnalysisResult): AnalysisResult {
    return {
      ...result,
      moodSpecificSummary: this.transformSummaryWitty(result.summary),
      moodSpecificStrengths: result.strengths.map(this.transformStrengthWitty),
      moodSpecificImprovements: result.improvements.map(this.transformImprovementWitty)
    };
  }

  private static applyMotivationalMood(result: AnalysisResult): AnalysisResult {
    return {
      ...result,
      moodSpecificSummary: this.transformSummaryMotivational(result.summary),
      moodSpecificStrengths: result.strengths.map(this.transformStrengthMotivational),
      moodSpecificImprovements: result.improvements.map(this.transformImprovementMotivational)
    };
  }

  // Brutal transformations
  private static transformSummaryBrutal(summary: string): string {
    return `Look, here's the deal: ${summary} Time to face reality and fix what's broken.`;
  }

  private static transformStrengthBrutal(strength: string): string {
    const brutals = [
      `Fine, you got this right: ${strength}`,
      `At least you didn't mess up: ${strength}`,
      `This actually works: ${strength}`,
      `Credit where it's due: ${strength}`
    ];
    return brutals[Math.floor(Math.random() * brutals.length)];
  }

  private static transformImprovementBrutal(improvement: string): string {
    const brutals = [
      `Stop ignoring this: ${improvement}`,
      `This is holding you back: ${improvement}`,
      `Fix this immediately: ${improvement}`,
      `You're losing opportunities because: ${improvement}`
    ];
    return brutals[Math.floor(Math.random() * brutals.length)];
  }

  // Soft transformations
  private static transformSummarySoft(summary: string): string {
    return `You have such wonderful potential! ${summary} Keep believing in yourself and your amazing journey! 💕`;
  }

  private static transformStrengthSoft(strength: string): string {
    const softs = [
      `You're doing amazing with: ${strength} ✨`,
      `I love how you've shown: ${strength} 🌟`,
      `You should be proud of: ${strength} 💖`,
      `This is absolutely lovely: ${strength} 🌸`
    ];
    return softs[Math.floor(Math.random() * softs.length)];
  }

  private static transformImprovementSoft(improvement: string): string {
    const softs = [
      `With a little love and attention, consider: ${improvement} 🌱`,
      `When you're ready, maybe try: ${improvement} 💫`,
      `A gentle suggestion: ${improvement} 🤗`,
      `You might find it helpful to: ${improvement} 🌈`
    ];
    return softs[Math.floor(Math.random() * softs.length)];
  }

  // Professional transformations
  private static transformSummaryProfessional(summary: string): string {
    return `Executive Summary: ${summary} This comprehensive assessment provides strategic recommendations for optimal career advancement and professional development.`;
  }

  private static transformStrengthProfessional(strength: string): string {
    return `✓ Demonstrated competency: ${strength}`;
  }

  private static transformImprovementProfessional(improvement: string): string {
    return `→ Strategic recommendation: ${improvement}`;
  }

  // Witty transformations
  private static transformSummaryWitty(summary: string): string {
    return `Well, well, well... ${summary} Let's see what we're working with here! 😏`;
  }

  private static transformStrengthWitty(strength: string): string {
    const wittys = [
      `Not gonna lie, this is actually solid: ${strength} 👌`,
      `Plot twist: you nailed this one: ${strength} 🎯`,
      `Okay, I'll give you this: ${strength} 😎`,
      `Surprisingly decent: ${strength} 🤷‍♂️`
    ];
    return wittys[Math.floor(Math.random() * wittys.length)];
  }

  private static transformImprovementWitty(improvement: string): string {
    const wittys = [
      `Hate to break it to you, but: ${improvement} 🙃`,
      `Here's the tea: ${improvement} ☕`,
      `Reality check incoming: ${improvement} 📢`,
      `Plot armor won't save you from: ${improvement} 🛡️`
    ];
    return wittys[Math.floor(Math.random() * wittys.length)];
  }

  // Motivational transformations
  private static transformSummaryMotivational(summary: string): string {
    return `CHAMPION! ${summary} You're on the path to GREATNESS and nothing can stop you! 🚀💪`;
  }

  private static transformStrengthMotivational(strength: string): string {
    const motivationals = [
      `CRUSHING IT with: ${strength}! Keep that energy! 💪`,
      `You're DOMINATING: ${strength}! This is your superpower! ⚡`,
      `BEAST MODE activated on: ${strength}! Unstoppable! 🔥`,
      `LEGENDARY performance in: ${strength}! You're built different! 🏆`
    ];
    return motivationals[Math.floor(Math.random() * motivationals.length)];
  }

  private static transformImprovementMotivational(improvement: string): string {
    const motivationals = [
      `LEVEL UP opportunity: ${improvement}! You got this! 🎯`,
      `NEXT CHALLENGE unlocked: ${improvement}! Time to shine! ✨`,
      `POWER UP available: ${improvement}! Claim your upgrade! ⬆️`,
      `BOSS BATTLE ahead: ${improvement}! Show them what you're made of! 💥`
    ];
    return motivationals[Math.floor(Math.random() * motivationals.length)];
  }

  // Get mood-specific UI theme
  static getMoodTheme(mood: AnalysisMood) {
    const themes = {
      brutal: {
        primaryColor: 'red',
        bgGradient: 'from-red-50 to-gray-100',
        cardBg: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        accentColor: 'text-red-600',
        buttonColor: 'bg-red-600 hover:bg-red-700',
        font: 'font-mono'
      },
      soft: {
        primaryColor: 'pink',
        bgGradient: 'from-pink-50 to-purple-50',
        cardBg: 'bg-pink-50',
        borderColor: 'border-pink-200',
        textColor: 'text-pink-800',
        accentColor: 'text-pink-600',
        buttonColor: 'bg-pink-600 hover:bg-pink-700',
        font: 'font-sans'
      },
      professional: {
        primaryColor: 'blue',
        bgGradient: 'from-blue-50 to-slate-100',
        cardBg: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        accentColor: 'text-blue-600',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
        font: 'font-serif'
      },
      witty: {
        primaryColor: 'purple',
        bgGradient: 'from-purple-50 to-indigo-50',
        cardBg: 'bg-purple-50',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-800',
        accentColor: 'text-purple-600',
        buttonColor: 'bg-purple-600 hover:bg-purple-700',
        font: 'font-bold'
      },
      motivational: {
        primaryColor: 'orange',
        bgGradient: 'from-orange-50 to-yellow-50',
        cardBg: 'bg-orange-50',
        borderColor: 'border-orange-200',
        textColor: 'text-orange-800',
        accentColor: 'text-orange-600',
        buttonColor: 'bg-orange-600 hover:bg-orange-700',
        font: 'font-bold'
      }
    };

    return themes[mood] || themes.professional;
  }
}