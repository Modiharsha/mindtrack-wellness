import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticateJWT, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { enforceStudentDataPrivacy } from '../middleware/privacyGuard';
import { RiskScoringService } from '../services/riskScoringService';
import { NotificationService } from '../services/notificationService';
import { SurveyQuestion } from '../types';

const router = Router();

/**
 * GET /api/surveys
 * List all active surveys available to students
 */
router.get('/', authenticateJWT, async (_req, res: Response): Promise<void> => {
  try {
    const surveys = await prisma.survey.findMany({
      where: { active: true },
      orderBy: { createdAt: 'asc' },
    });

    const parsed = surveys.map(s => ({
      ...s,
      questions: JSON.parse(s.questions) as SurveyQuestion[],
      scoringRules: s.scoringRules ? JSON.parse(s.scoringRules) : null,
    }));

    res.json({ surveys: parsed });
  } catch (err) {
    console.error('List surveys error:', err);
    res.status(500).json({ error: 'Failed to retrieve surveys' });
  }
});

/**
 * GET /api/surveys/:id
 * Get single survey structure
 */
router.get('/:id', authenticateJWT, async (req, res: Response): Promise<void> => {
  try {
    const survey = await prisma.survey.findUnique({
      where: { id: req.params.id },
    });

    if (!survey) {
      res.status(404).json({ error: 'Survey not found' });
      return;
    }

    res.json({
      survey: {
        ...survey,
        questions: JSON.parse(survey.questions),
        scoringRules: survey.scoringRules ? JSON.parse(survey.scoringRules) : null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve survey' });
  }
});

/**
 * POST /api/surveys/:id/draft
 * Save partial response without final scoring
 */
router.post(
  '/:id/draft',
  authenticateJWT,
  requireRole(['STUDENT']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const studentId = req.user!.studentProfileId;
      if (!studentId) {
        res.status(400).json({ error: 'Student profile required' });
        return;
      }

      const surveyId = req.params.id;
      const { answers } = req.body;

      const draft = await prisma.surveyResponse.create({
        data: {
          surveyId,
          studentId,
          answers: JSON.stringify(answers || {}),
          score: 0,
          riskLevel: 'LOW',
          isDraft: true,
        },
      });

      res.json({ message: 'Progress saved successfully', draftId: draft.id });
    } catch (err) {
      res.status(500).json({ error: 'Failed to save survey draft' });
    }
  }
);

/**
 * POST /api/surveys/:id/submit
 * Submit finished survey response, calculate score, evaluate risk, trigger triage if needed
 */
router.post(
  '/:id/submit',
  authenticateJWT,
  requireRole(['STUDENT']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const studentId = req.user!.studentProfileId;
      if (!studentId) {
        res.status(400).json({ error: 'Student profile required' });
        return;
      }

      const surveyId = req.params.id;
      const { answers } = req.body; // e.g. { "q1": 2, "q2": 3 }

      const survey = await prisma.survey.findUnique({
        where: { id: surveyId },
      });

      if (!survey) {
        res.status(404).json({ error: 'Survey not found' });
        return;
      }

      const questions = JSON.parse(survey.questions) as SurveyQuestion[];
      const scoringRules = survey.scoringRules ? JSON.parse(survey.scoringRules) : null;

      // Calculate total score based on questions
      let calculatedScore = 0;
      let maxScore = 0;

      questions.forEach(q => {
        const val = Number(answers[q.id]) || 0;
        calculatedScore += val;
        // max value among options
        const maxOpt = Math.max(...(q.options?.map(o => o.value) || [3]), 3);
        maxScore += maxOpt;
      });

      if (maxScore === 0) maxScore = 27;

      // Fetch recent 14-day mood entries to generate comprehensive evaluation
      const recentMoods = await prisma.moodEntry.findMany({
        where: { studentId },
        orderBy: { entryDate: 'asc' },
        take: 14,
      });

      const parsedMoods = recentMoods.map(m => ({
        moodValue: m.moodValue,
        entryDate: m.entryDate,
        emotionTags: m.emotionTags ? JSON.parse(m.emotionTags) : [],
      }));

      // Evaluate through Risk Engine
      const riskEvaluation = RiskScoringService.calculateRisk({
        recentSurveyScore: calculatedScore,
        surveyMaxScore: maxScore,
        surveyCategory: survey.category,
        recentMoodEntries: parsedMoods,
      });

      // Record response
      const response = await prisma.surveyResponse.create({
        data: {
          surveyId,
          studentId,
          answers: JSON.stringify(answers),
          score: calculatedScore,
          riskLevel: riskEvaluation.riskLevel,
          summary: riskEvaluation.supportivePrompt,
          isDraft: false,
        },
      });

      // Record risk assessment
      await prisma.riskAssessment.create({
        data: {
          studentId,
          riskLevel: riskEvaluation.riskLevel,
          compositeScore: riskEvaluation.compositeScore,
          primaryCategory: riskEvaluation.primaryCategory,
          contributingFactors: JSON.stringify(riskEvaluation.contributingFactors),
          triggerSource: 'SURVEY',
        },
      });

      // Alert counselor if required
      if (riskEvaluation.requiresCounselorAlert) {
        await NotificationService.notifyCounselorOfRiskFlag(
          studentId,
          req.user!.name,
          riskEvaluation.riskLevel,
          riskEvaluation.contributingFactors
        );
      }

      // Fetch recommended resources based on category
      const recommendations = await prisma.recommendation.findMany({
        where: {
          active: true,
          OR: [
            { category: survey.category },
            { category: 'GENERAL' },
            ...(riskEvaluation.riskLevel === 'NEEDS_ATTENTION' ? [{ category: 'CRISIS' }] : []),
          ],
        },
        take: 4,
      });

      res.status(201).json({
        message: 'Survey completed and evaluated',
        responseId: response.id,
        score: calculatedScore,
        maxScore,
        riskLevel: riskEvaluation.riskLevel,
        interpretation: riskEvaluation.supportivePrompt,
        contributingFactors: riskEvaluation.contributingFactors,
        recommendations,
      });
    } catch (err: any) {
      console.error('Survey submission error:', err);
      res.status(500).json({ error: 'Failed to process survey submission' });
    }
  }
);

/**
 * GET /api/surveys/history/my
 * Get student's previous survey responses
 */
router.get(
  '/history/my',
  authenticateJWT,
  enforceStudentDataPrivacy,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const targetStudentId = (req.query.studentId as string) || req.user!.studentProfileId;

      if (!targetStudentId) {
        res.status(400).json({ error: 'Student ID required' });
        return;
      }

      const responses = await prisma.surveyResponse.findMany({
        where: { studentId: targetStudentId, isDraft: false },
        include: { survey: { select: { title: true, category: true, slug: true } } },
        orderBy: { submittedAt: 'desc' },
      });

      const formatted = responses.map(r => ({
        id: r.id,
        surveyTitle: r.survey.title,
        category: r.survey.category,
        score: r.score,
        riskLevel: r.riskLevel,
        summary: r.summary,
        submittedAt: r.submittedAt,
      }));

      res.json({ history: formatted });
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve survey history' });
    }
  }
);

export default router;
