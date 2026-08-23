import { RiskLevel, WellnessCategory, RiskScoringInput, RiskScoringResult } from '../types';

/**
 * MindTrack Intelligent Risk Scoring & Triage Engine
 * 
 * Evaluates multidimensional wellness markers:
 * 1. Validated survey score percentage (e.g. PHQ-9 style screener, academic stress index)
 * 2. Recent mood trajectory (slope & average of last 7-14 days)
 * 3. Consecutive low-mood streak detection (3+ consecutive days with mood <= 2)
 * 4. Frequency of distress tags (e.g., "Overwhelmed", "Panic", "Hopeless")
 * 5. Category identification (ACADEMIC, SLEEP, EMOTIONAL, PHYSICAL, SOCIAL)
 */
export class RiskScoringService {
  /**
   * Main evaluation method returning a standardized risk assessment.
   */
  public static calculateRisk(input: RiskScoringInput): RiskScoringResult {
    const factors: string[] = [];
    let compositeScore = 0;
    let surveyComponent = 0;
    let moodComponent = 0;
    let streakComponent = 0;
    let requiresAlert = false;

    // 1. Survey Scoring Component (0 to 50 points)
    if (input.recentSurveyScore !== undefined && input.surveyMaxScore !== undefined && input.surveyMaxScore > 0) {
      const surveyRatio = input.recentSurveyScore / input.surveyMaxScore;
      surveyComponent = Math.min(50, surveyRatio * 50);

      if (surveyRatio >= 0.70) {
        factors.push(`Survey score in upper 30th percentile (${input.recentSurveyScore}/${input.surveyMaxScore})`);
        requiresAlert = true;
      } else if (surveyRatio >= 0.45) {
        factors.push(`Survey score indicated moderate strain (${input.recentSurveyScore}/${input.surveyMaxScore})`);
      }
    }

    // 2. Mood & Streak Component (0 to 50 points)
    const moods = input.recentMoodEntries || [];
    if (moods.length > 0) {
      // Sort moods by date ascending
      const sortedMoods = [...moods].sort((a, b) => a.entryDate.localeCompare(b.entryDate));
      
      // Calculate recent 7-day average (1=Struggling, 5=Thriving)
      const last7Days = sortedMoods.slice(-7);
      const avgMood = last7Days.reduce((acc, curr) => acc + curr.moodValue, 0) / last7Days.length;
      
      // Convert avgMood (1-5) to penalty (1 => 30 points penalty, 5 => 0 points penalty)
      const moodPenalty = Math.max(0, (3.5 - avgMood) * 12);
      moodComponent = Math.min(30, moodPenalty);

      if (avgMood < 2.2) {
        factors.push(`Low 7-day average mood (${avgMood.toFixed(1)}/5)`);
      }

      // Check for consecutive low mood streak (mood <= 2)
      let currentStreak = 0;
      let maxLowStreak = 0;

      for (let i = 0; i < sortedMoods.length; i++) {
        if (sortedMoods[i].moodValue <= 2) {
          currentStreak++;
          if (currentStreak > maxLowStreak) maxLowStreak = currentStreak;
        } else {
          currentStreak = 0;
        }
      }

      // If current active streak at the end is >= 3 days
      let activeLowStreak = 0;
      for (let i = sortedMoods.length - 1; i >= 0; i--) {
        if (sortedMoods[i].moodValue <= 2) {
          activeLowStreak++;
        } else {
          break;
        }
      }

      if (activeLowStreak >= 3) {
        streakComponent += 25;
        factors.push(`Ongoing ${activeLowStreak}-day low mood streak`);
        requiresAlert = true;
      } else if (maxLowStreak >= 3) {
        streakComponent += 15;
        factors.push(`Recent pattern of ${maxLowStreak} consecutive difficult days`);
      }

      // Check for negative emotion tags
      const distressTags = ['overwhelmed', 'hopeless', 'panic', 'can\'t sleep', 'exhausted', 'failing', 'isolated'];
      const foundTags = new Set<string>();

      last7Days.forEach(m => {
        if (m.emotionTags && Array.isArray(m.emotionTags)) {
          m.emotionTags.forEach(tag => {
            if (distressTags.includes(tag.toLowerCase())) {
              foundTags.add(tag);
            }
          });
        }
      });

      if (foundTags.size >= 2) {
        factors.push(`Multiple distress indicators logged: ${Array.from(foundTags).slice(0, 3).join(', ')}`);
        moodComponent = Math.min(35, moodComponent + 5);
      }
    }

    // Critical explicit triggers
    if (input.criticalTriggers && input.criticalTriggers.length > 0) {
      factors.push(...input.criticalTriggers);
      compositeScore += 35;
      requiresAlert = true;
    }

    // Calculate total composite score (0 - 100)
    compositeScore = Math.min(100, Math.round(surveyComponent + moodComponent + streakComponent));

    // Determine Risk Level
    let riskLevel: RiskLevel = 'LOW';
    if (compositeScore >= 65 || requiresAlert) {
      riskLevel = 'NEEDS_ATTENTION';
      requiresAlert = true;
    } else if (compositeScore >= 35) {
      riskLevel = 'MODERATE';
    } else {
      riskLevel = 'LOW';
    }

    // Determine Primary Category
    let primaryCategory: WellnessCategory = 'GENERAL';
    if (input.surveyCategory) {
      const cat = input.surveyCategory.toUpperCase();
      if (['ACADEMIC', 'SLEEP', 'EMOTIONAL', 'PHYSICAL', 'SOCIAL'].includes(cat)) {
        primaryCategory = cat as WellnessCategory;
      }
    }

    // If factors are empty, provide a reassuring note
    if (factors.length === 0) {
      factors.push('Wellness indicators are within a steady, healthy range.');
    }

    // Generate Supportive Prompt (non-clinical, empathetic framing)
    let supportivePrompt = 'You are maintaining a steady wellness balance. Check out everyday micro-habits and focus tools.';
    if (riskLevel === 'NEEDS_ATTENTION') {
      supportivePrompt = 'We noticed things may feel heavy right now. You are not alone — consider connecting with your assigned counselor or trying a guided calming exercise.';
    } else if (riskLevel === 'MODERATE') {
      supportivePrompt = 'School and life can bring up temporary stress. Take a moment for yourself with our gentle relaxation and study balance tools.';
    }

    // Source tracking
    const triggerSource = input.recentSurveyScore !== undefined && input.recentMoodEntries?.length
      ? 'COMPOSITE'
      : input.recentSurveyScore !== undefined
      ? 'SURVEY'
      : 'MOOD_STREAK';

    return {
      riskLevel,
      compositeScore,
      primaryCategory,
      contributingFactors: factors,
      triggerSource,
      requiresCounselorAlert: requiresAlert,
      supportivePrompt,
    };
  }
}
