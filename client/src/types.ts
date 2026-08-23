export type UserRole = 'STUDENT' | 'COUNSELOR' | 'ADMIN';

export type RiskLevel = 'LOW' | 'MODERATE' | 'NEEDS_ATTENTION';

export type WellnessCategory = 'GENERAL' | 'ACADEMIC' | 'SLEEP' | 'EMOTIONAL' | 'PHYSICAL' | 'SOCIAL' | 'CRISIS';

export type AppointmentStatus = 'REQUESTED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isApproved: boolean;
  avatar?: string;
  studentProfile?: StudentProfile;
  counselorProfile?: CounselorProfile;
}

export interface StudentProfile {
  id: string;
  userId: string;
  program: string;
  graduationYear: number;
  assignedCounselorId?: string;
  consentGiven: boolean;
  consentDate?: string;
  counselor?: {
    id: string;
    department: string;
    title: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
  };
}

export interface CounselorProfile {
  id: string;
  userId: string;
  department: string;
  title: string;
  bio?: string;
  officeHours?: string;
  contactEmail?: string;
  maxCaseload: number;
  user?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

export interface MoodEntry {
  id: string;
  moodValue: number;
  emotionTags: string[];
  note?: string;
  entryDate: string;
  createdAt: string;
}

export interface MoodStats {
  totalLogged: number;
  streakDays: number;
  averageMood: number;
  hasLoggedToday: boolean;
}

export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'scale' | 'multiple_choice' | 'boolean' | 'text';
  options: {
    value: number;
    label: string;
    subtext?: string;
  }[];
}

export interface Survey {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: WellnessCategory;
  estimatedMinutes: number;
  questions: SurveyQuestion[];
  scoringRules?: {
    maxScore: number;
    moderateThreshold: number;
    needsAttentionThreshold: number;
    interpretation?: {
      low: string;
      moderate: string;
      needsAttention: string;
    };
  };
  active: boolean;
  createdAt: string;
}

export interface SurveyHistoryItem {
  id: string;
  surveyTitle: string;
  category: WellnessCategory;
  score: number;
  riskLevel: RiskLevel;
  summary?: string;
  submittedAt: string;
}

export interface Recommendation {
  id: string;
  category: WellnessCategory;
  title: string;
  summary: string;
  content: string;
  resourceLink?: string;
  iconType: string;
  urgencyLevel: 'GENERAL' | 'RECOMMENDED' | 'URGENT';
  active: boolean;
}

export interface Appointment {
  id: string;
  studentId: string;
  counselorId: string;
  status: AppointmentStatus;
  requestedSlot: string;
  scheduledAt?: string;
  studentNotes?: string;
  counselorNotes?: string;
  meetingLink?: string;
  createdAt: string;
  student?: {
    id: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
  };
  counselor?: {
    id: string;
    department: string;
    title: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatar?: string;
    };
  };
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  sentAt: string;
  readAt?: string;
  sender: {
    id: string;
    name: string;
    role: UserRole;
    avatar?: string;
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ALERT' | 'APPOINTMENT' | 'MESSAGE' | 'SURVEY_REMINDER' | 'RESOURCE' | 'INFO';
  linkUrl?: string;
  isRead: boolean;
  createdAt: string;
}

export interface AssignedStudentRosterItem {
  studentProfileId: string;
  userId: string;
  name: string;
  email: string;
  program: string;
  graduationYear: number;
  consentGiven: boolean;
  riskLevel: RiskLevel;
  compositeScore: number;
  primaryCategory: WellnessCategory;
  contributingFactors: string[];
  lastRiskGeneratedAt: string;
  latestSurvey?: {
    title: string;
    score: number;
    riskLevel: RiskLevel;
    submittedAt: string;
  };
  avg7DayMood: number | null;
  activeLowStreak: number;
  pendingAppointment: boolean;
}

export interface StudentDetailData {
  id: string;
  userId: string;
  name: string;
  email: string;
  program: string;
  graduationYear: number;
  consentGiven: boolean;
  moodHistory: MoodEntry[];
  surveyHistory: {
    id: string;
    title: string;
    category: WellnessCategory;
    score: number;
    riskLevel: RiskLevel;
    summary?: string;
    submittedAt: string;
    answers: Record<string, any>;
  }[];
  riskHistory: {
    id: string;
    riskLevel: RiskLevel;
    compositeScore: number;
    primaryCategory: WellnessCategory;
    contributingFactors: string[];
    triggerSource: string;
    isResolved: boolean;
    generatedAt: string;
  }[];
  appointments: Appointment[];
  notes: {
    id: string;
    noteContent: string;
    isPrivate: boolean;
    createdAt: string;
    counselor: { name: string };
  }[];
}

export interface AdminAnalyticsData {
  overview: {
    totalStudents: number;
    consentedStudents: number;
    consentRate: number;
    totalCounselors: number;
    totalSurveysCompleted: number;
    totalMoodsLogged: number;
  };
  riskDistribution: {
    name: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  categoryDistribution: {
    category: string;
    count: number;
    percentage: number;
  }[];
  moodTrendsOverTime: {
    date: string;
    averageMood: number;
    totalCheckIns: number;
  }[];
  programStats: {
    program: string;
    enrolledCount: number;
    needsAttentionPercent: number;
    averageWellnessIndex: number;
  }[];
}
