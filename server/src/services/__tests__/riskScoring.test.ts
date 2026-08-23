import { describe, it, expect } from 'vitest';
import { RiskScoringService } from '../riskScoringService';

describe('RiskScoringService Unit Tests', () => {
  it('should return LOW risk for healthy inputs (low survey score + positive mood)', () => {
    const result = RiskScoringService.calculateRisk({
      recentSurveyScore: 2,
      surveyMaxScore: 27,
      surveyCategory: 'EMOTIONAL',
      recentMoodEntries: [
        { moodValue: 5, entryDate: '2026-08-01', emotionTags: ['Motivated'] },
        { moodValue: 4, entryDate: '2026-08-02', emotionTags: ['Calm'] },
        { moodValue: 4, entryDate: '2026-08-03', emotionTags: ['Focused'] },
      ],
    });

    expect(result.riskLevel).toBe('LOW');
    expect(result.compositeScore).toBeLessThan(35);
    expect(result.requiresCounselorAlert).toBe(false);
    expect(result.primaryCategory).toBe('EMOTIONAL');
  });

  it('should return MODERATE risk for elevated survey scores or mild mood dips', () => {
    const result = RiskScoringService.calculateRisk({
      recentSurveyScore: 12,
      surveyMaxScore: 27, // 44%
      surveyCategory: 'ACADEMIC',
      recentMoodEntries: [
        { moodValue: 3, entryDate: '2026-08-01', emotionTags: ['Tired'] },
        { moodValue: 2, entryDate: '2026-08-02', emotionTags: ['Stressed'] },
        { moodValue: 3, entryDate: '2026-08-03', emotionTags: ['Fine'] },
      ],
    });

    expect(['MODERATE', 'LOW']).toContain(result.riskLevel);
    expect(result.primaryCategory).toBe('ACADEMIC');
  });

  it('should flag NEEDS_ATTENTION and require counselor alert when 3+ consecutive low moods occur', () => {
    const result = RiskScoringService.calculateRisk({
      recentMoodEntries: [
        { moodValue: 3, entryDate: '2026-08-01' },
        { moodValue: 2, entryDate: '2026-08-02', emotionTags: ['Overwhelmed'] },
        { moodValue: 1, entryDate: '2026-08-03', emotionTags: ['Panic', 'Hopeless'] },
        { moodValue: 1, entryDate: '2026-08-04', emotionTags: ['Exhausted'] },
      ],
    });

    expect(result.riskLevel).toBe('NEEDS_ATTENTION');
    expect(result.requiresCounselorAlert).toBe(true);
    expect(result.contributingFactors.some(f => f.includes('low mood streak'))).toBe(true);
  });

  it('should flag high survey scores >= 70% as elevated risk and attribute category properly', () => {
    const result = RiskScoringService.calculateRisk({
      recentSurveyScore: 22,
      surveyMaxScore: 27, // 81%
      surveyCategory: 'SLEEP',
      recentMoodEntries: [
        { moodValue: 2, entryDate: '2026-08-01' },
        { moodValue: 2, entryDate: '2026-08-02' },
      ],
    });

    expect(result.riskLevel).toBe('NEEDS_ATTENTION');
    expect(result.primaryCategory).toBe('SLEEP');
    expect(result.requiresCounselorAlert).toBe(true);
  });

  it('should activate immediate alert when critical explicit triggers are provided', () => {
    const result = RiskScoringService.calculateRisk({
      criticalTriggers: ['Explicit acute distress marker reported'],
    });

    expect(result.riskLevel).toBe('NEEDS_ATTENTION');
    expect(result.requiresCounselorAlert).toBe(true);
    expect(result.contributingFactors).toContain('Explicit acute distress marker reported');
  });
});
