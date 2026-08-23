import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticateJWT, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { enforceStudentDataPrivacy } from '../middleware/privacyGuard';
import { RiskScoringService } from '../services/riskScoringService';
import { NotificationService } from '../services/notificationService';

const router = Router();

const moodLogSchema = z.object({
  moodValue: z.number().int().min(1).max(5),
  emotionTags: z.array(z.string()).optional(),
  note: z.string().max(500).optional(),
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD').optional(),
});

/**
 * POST /api/mood
 * Log or update today's mood entry for the authenticated student.
 */
router.post('/', authenticateJWT, requireRole(['STUDENT']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentProfileId = req.user!.studentProfileId;
    if (!studentProfileId) {
      res.status(400).json({ error: 'Student profile not found for this user' });
      return;
    }

    const parseResult = moodLogSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { moodValue, emotionTags, note } = parseResult.data;
    const entryDate = parseResult.data.entryDate || new Date().toISOString().split('T')[0];

    const entry = await prisma.moodEntry.upsert({
      where: {
        studentId_entryDate: {
          studentId: studentProfileId,
          entryDate,
        },
      },
      update: {
        moodValue,
        emotionTags: emotionTags ? JSON.stringify(emotionTags) : null,
        note,
      },
      create: {
        studentId: studentProfileId,
        moodValue,
        emotionTags: emotionTags ? JSON.stringify(emotionTags) : null,
        note,
        entryDate,
      },
    });

    // Check recent 14-day history to evaluate streaks & risk triggers
    const recentMoods = await prisma.moodEntry.findMany({
      where: { studentId: studentProfileId },
      orderBy: { entryDate: 'asc' },
      take: 14,
    });

    const parsedMoods = recentMoods.map(m => ({
      moodValue: m.moodValue,
      entryDate: m.entryDate,
      emotionTags: m.emotionTags ? JSON.parse(m.emotionTags) : [],
    }));

    // Run risk scoring engine
    const evaluation = RiskScoringService.calculateRisk({
      recentMoodEntries: parsedMoods,
    });

    // If student crossed into NEEDS_ATTENTION or MODERATE, persist updated assessment
    if (evaluation.riskLevel !== 'LOW' || evaluation.requiresCounselorAlert) {
      await prisma.riskAssessment.create({
        data: {
          studentId: studentProfileId,
          riskLevel: evaluation.riskLevel,
          compositeScore: evaluation.compositeScore,
          primaryCategory: evaluation.primaryCategory,
          contributingFactors: JSON.stringify(evaluation.contributingFactors),
          triggerSource: evaluation.triggerSource,
        },
      });

      if (evaluation.requiresCounselorAlert) {
        await NotificationService.notifyCounselorOfRiskFlag(
          studentProfileId,
          req.user!.name,
          evaluation.riskLevel,
          evaluation.contributingFactors
        );
      }
    }

    res.status(201).json({
      message: 'Mood logged successfully',
      entry: {
        ...entry,
        emotionTags: entry.emotionTags ? JSON.parse(entry.emotionTags) : [],
      },
      riskEvaluation: evaluation,
    });
  } catch (err: any) {
    console.error('Mood logging error:', err);
    res.status(500).json({ error: 'Failed to record mood entry' });
  }
});

/**
 * GET /api/mood/history
 * Fetch student's mood history (defaults to current student, or counselor accessing assigned student)
 */
router.get(
  '/history',
  authenticateJWT,
  enforceStudentDataPrivacy,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const targetStudentId = (req.query.studentId as string) || req.user!.studentProfileId;

      if (!targetStudentId) {
        res.status(400).json({ error: 'Student ID required' });
        return;
      }

      const days = parseInt(req.query.days as string, 10) || 30;

      const entries = await prisma.moodEntry.findMany({
        where: { studentId: targetStudentId },
        orderBy: { entryDate: 'asc' },
        take: days,
      });

      const formatted = entries.map(e => ({
        id: e.id,
        moodValue: e.moodValue,
        emotionTags: e.emotionTags ? JSON.parse(e.emotionTags) : [],
        note: e.note,
        entryDate: e.entryDate,
        createdAt: e.createdAt,
      }));

      // Calculate streak
      let streak = 0;
      const todayStr = new Date().toISOString().split('T')[0];
      const dateSet = new Set(entries.map(e => e.entryDate));

      let checkDate = new Date();
      // If today is not logged yet, start checking from yesterday for streak retention
      if (!dateSet.has(todayStr)) {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (true) {
        const dStr = checkDate.toISOString().split('T')[0];
        if (dateSet.has(dStr)) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      // Calculate averages
      const avgMood =
        formatted.length > 0
          ? formatted.reduce((acc, curr) => acc + curr.moodValue, 0) / formatted.length
          : 0;

      res.json({
        entries: formatted,
        stats: {
          totalLogged: formatted.length,
          streakDays: streak,
          averageMood: Number(avgMood.toFixed(2)),
          hasLoggedToday: dateSet.has(todayStr),
        },
      });
    } catch (err) {
      console.error('Fetch mood error:', err);
      res.status(500).json({ error: 'Failed to retrieve mood history' });
    }
  }
);

export default router;
