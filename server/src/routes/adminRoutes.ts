import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticateJWT, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const surveyTemplateSchema = z.object({
  slug: z.string().min(2),
  title: z.string().min(3),
  description: z.string().min(5),
  category: z.enum(['GENERAL', 'ACADEMIC', 'SLEEP', 'EMOTIONAL', 'PHYSICAL', 'SOCIAL']).default('GENERAL'),
  estimatedMinutes: z.number().int().default(5),
  questions: z.array(z.any()).min(1, 'At least one question is required'),
  scoringRules: z.any().optional(),
  active: z.boolean().default(true),
});

/**
 * GET /api/admin/analytics/aggregate
 * Strictly aggregated and anonymized campus wellness metrics.
 * GUARANTEE: Zero student PII (no names, emails, user IDs, or raw responses).
 */
router.get(
  '/analytics/aggregate',
  authenticateJWT,
  requireRole(['ADMIN']),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      // 1. Total Student Counts
      const totalStudents = await prisma.studentProfile.count();
      const consentedStudents = await prisma.studentProfile.count({ where: { consentGiven: true } });
      const totalCounselors = await prisma.counselorProfile.count();
      const totalSurveysCompleted = await prisma.surveyResponse.count({ where: { isDraft: false } });
      const totalMoodsLogged = await prisma.moodEntry.count();

      // 2. Risk Level Distribution (Latest risk per student)
      const students = await prisma.studentProfile.findMany({
        select: {
          id: true,
          program: true,
          riskAssessments: {
            orderBy: { generatedAt: 'desc' },
            take: 1,
            select: { riskLevel: true, primaryCategory: true, compositeScore: true },
          },
        },
      });

      let lowCount = 0;
      let moderateCount = 0;
      let needsAttentionCount = 0;
      const categoryCounts: Record<string, number> = {
        ACADEMIC: 0,
        SLEEP: 0,
        EMOTIONAL: 0,
        PHYSICAL: 0,
        SOCIAL: 0,
        GENERAL: 0,
      };

      const programBreakdown: Record<string, { total: number; needsAttention: number; avgScoreSum: number }> = {};

      students.forEach(s => {
        const latestRisk = s.riskAssessments[0];
        const rLevel = latestRisk?.riskLevel || 'LOW';
        const pCat = latestRisk?.primaryCategory || 'GENERAL';
        const score = latestRisk?.compositeScore || 15;

        if (rLevel === 'NEEDS_ATTENTION') needsAttentionCount++;
        else if (rLevel === 'MODERATE') moderateCount++;
        else lowCount++;

        if (categoryCounts[pCat] !== undefined) {
          categoryCounts[pCat]++;
        } else {
          categoryCounts[pCat] = 1;
        }

        const prog = s.program || 'General';
        if (!programBreakdown[prog]) {
          programBreakdown[prog] = { total: 0, needsAttention: 0, avgScoreSum: 0 };
        }
        programBreakdown[prog].total++;
        if (rLevel === 'NEEDS_ATTENTION') programBreakdown[prog].needsAttention++;
        programBreakdown[prog].avgScoreSum += score;
      });

      const totalAssessed = Math.max(1, totalStudents);
      const riskDistribution = [
        { name: 'Low / Thriving', count: lowCount, percentage: Number(((lowCount / totalAssessed) * 100).toFixed(1)), color: '#10B981' },
        { name: 'Moderate Check-in', count: moderateCount, percentage: Number(((moderateCount / totalAssessed) * 100).toFixed(1)), color: '#F59E0B' },
        { name: 'Needs Attention', count: needsAttentionCount, percentage: Number(((needsAttentionCount / totalAssessed) * 100).toFixed(1)), color: '#EF4444' },
      ];

      const categoryDistribution = Object.entries(categoryCounts).map(([category, count]) => ({
        category,
        count,
        percentage: Number(((count / totalAssessed) * 100).toFixed(1)),
      }));

      // 3. 30-Day Aggregate Mood Trend (Anonymized daily campus average)
      const allMoods = await prisma.moodEntry.findMany({
        select: { entryDate: true, moodValue: true },
        orderBy: { entryDate: 'asc' },
      });

      const dailyMoodAggregates: Record<string, { sum: number; count: number }> = {};
      allMoods.forEach(m => {
        if (!dailyMoodAggregates[m.entryDate]) {
          dailyMoodAggregates[m.entryDate] = { sum: 0, count: 0 };
        }
        dailyMoodAggregates[m.entryDate].sum += m.moodValue;
        dailyMoodAggregates[m.entryDate].count += 1;
      });

      const moodTrendsOverTime = Object.entries(dailyMoodAggregates)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([date, data]) => ({
          date,
          averageMood: Number((data.sum / data.count).toFixed(2)),
          totalCheckIns: data.count,
        }));

      // 4. Program / Department Aggregate Summary
      const programStats = Object.entries(programBreakdown).map(([program, stats]) => ({
        program,
        enrolledCount: stats.total,
        needsAttentionPercent: Number(((stats.needsAttention / stats.total) * 100).toFixed(1)),
        averageWellnessIndex: Number((100 - (stats.avgScoreSum / stats.total)).toFixed(1)), // Higher is healthier
      }));

      res.json({
        overview: {
          totalStudents,
          consentedStudents,
          consentRate: Number(((consentedStudents / Math.max(1, totalStudents)) * 100).toFixed(1)),
          totalCounselors,
          totalSurveysCompleted,
          totalMoodsLogged,
        },
        riskDistribution,
        categoryDistribution,
        moodTrendsOverTime,
        programStats,
      });
    } catch (err) {
      console.error('Aggregate analytics error:', err);
      res.status(500).json({ error: 'Failed to compute anonymized aggregate analytics' });
    }
  }
);

/**
 * GET /api/admin/surveys
 * List all surveys including inactive ones for template management
 */
router.get('/surveys', authenticateJWT, requireRole(['ADMIN']), async (_req, res: Response): Promise<void> => {
  try {
    const surveys = await prisma.survey.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const parsed = surveys.map(s => ({
      ...s,
      questions: JSON.parse(s.questions),
      scoringRules: s.scoringRules ? JSON.parse(s.scoringRules) : null,
    }));

    res.json({ surveys: parsed });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve surveys' });
  }
});

/**
 * POST /api/admin/surveys
 * Create a new structured JSON survey template
 */
router.post('/surveys', authenticateJWT, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = surveyTemplateSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { slug, title, description, category, estimatedMinutes, questions, scoringRules, active } = parseResult.data;

    // Check slug uniqueness
    const existing = await prisma.survey.findUnique({ where: { slug } });
    if (existing) {
      res.status(400).json({ error: 'A survey with this slug already exists' });
      return;
    }

    const created = await prisma.survey.create({
      data: {
        slug,
        title,
        description,
        category,
        estimatedMinutes,
        questions: JSON.stringify(questions),
        scoringRules: scoringRules ? JSON.stringify(scoringRules) : null,
        active,
      },
    });

    res.status(201).json({
      message: 'Survey template created successfully',
      survey: {
        ...created,
        questions: JSON.parse(created.questions),
        scoringRules: created.scoringRules ? JSON.parse(created.scoringRules) : null,
      },
    });
  } catch (err) {
    console.error('Create survey error:', err);
    res.status(500).json({ error: 'Failed to create survey template' });
  }
});

/**
 * PUT /api/admin/surveys/:id
 * Update survey template or activate/deactivate
 */
router.put('/surveys/:id', authenticateJWT, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description, category, estimatedMinutes, questions, scoringRules, active } = req.body;

    const updated = await prisma.survey.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        category,
        estimatedMinutes,
        questions: questions ? JSON.stringify(questions) : undefined,
        scoringRules: scoringRules ? JSON.stringify(scoringRules) : undefined,
        active,
      },
    });

    res.json({ message: 'Survey template updated', survey: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update survey template' });
  }
});

/**
 * GET /api/admin/users
 * Manage staff accounts & approvals
 */
router.get('/users', authenticateJWT, requireRole(['ADMIN']), async (_req, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isApproved: true,
        createdAt: true,
        counselorProfile: true,
        studentProfile: { select: { id: true, program: true, assignedCounselorId: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

/**
 * PUT /api/admin/users/:id/approve
 * Approve or toggle staff account status
 */
router.put('/users/:id/approve', authenticateJWT, requireRole(['ADMIN']), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { isApproved } = req.body;

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { isApproved: isApproved !== undefined ? isApproved : true },
    });

    res.json({ message: `User approval set to ${user.isApproved}`, user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user approval' });
  }
});

/**
 * PUT /api/admin/students/:studentId/assign-counselor
 * Assign or reassign counselor to a student
 */
router.put(
  '/students/:studentId/assign-counselor',
  authenticateJWT,
  requireRole(['ADMIN']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { counselorProfileId } = req.body;

      const updated = await prisma.studentProfile.update({
        where: { id: req.params.studentId },
        data: { assignedCounselorId: counselorProfileId },
        include: { counselor: { include: { user: true } }, user: true },
      });

      res.json({ message: 'Counselor assigned successfully', studentProfile: updated });
    } catch (err) {
      res.status(500).json({ error: 'Failed to assign counselor' });
    }
  }
);

export default router;
