export type UserRole = 'STUDENT' | 'COUNSELOR' | 'ADMIN';

export type RiskLevel = 'LOW' | 'MODERATE' | 'NEEDS_ATTENTION';

export type WellnessCategory = 'GENERAL' | 'ACADEMIC' | 'SLEEP' | 'EMOTIONAL' | 'PHYSICAL' | 'SOCIAL';

export type AppointmentStatus = 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface QuestionOption {
  value: number;
  label: string;
  subtext?: string;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  category?: string;
  type: 'scale' | 'multiple_choice' | 'boolean' | 'text';
  options: QuestionOption[];
  weight?: number;
}

export interface SurveyTemplate {
  slug: string;
  title: string;
  description: string;
  category: WellnessCategory;
  estimatedMinutes: number;
  questions: SurveyQuestion[];
  scoringRules: {
    moderateThreshold: number;
    needsAttentionThreshold: number;
    maxScore: number;
    interpretation: {
      low: string;
      moderate: string;
      needsAttention: string;
    };
  };
}

export interface MoodLogPayload {
  moodValue: number; // 1 to 5
  emotionTags?: string[];
  note?: string;
  entryDate?: string; // YYYY-MM-DD
}

export interface RiskScoringInput {
  recentSurveyScore?: number;
  surveyMaxScore?: number;
  surveyCategory?: string;
  recentMoodEntries?: {
    moodValue: number;
    entryDate: string;
    emotionTags?: string[];
  }[];
  criticalTriggers?: string[];
}

export interface RiskScoringResult {
  riskLevel: RiskLevel;
  compositeScore: number; // 0 to 100
  primaryCategory: WellnessCategory;
  contributingFactors: string[];
  triggerSource: 'SURVEY' | 'MOOD_STREAK' | 'COMPOSITE' | 'MANUAL';
  requiresCounselorAlert: boolean;
  supportivePrompt: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  name: string;
  studentProfileId?: string;
  counselorProfileId?: string;
}
