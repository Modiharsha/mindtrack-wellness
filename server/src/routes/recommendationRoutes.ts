import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticateJWT, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const recommendationSchema = z.object({
  category: z.enum(['GENERAL', 'ACADEMIC', 'SLEEP', 'EMOTIONAL', 'PHYSICAL', 'SOCIAL', 'CRISIS']).default('GENERAL'),
  title: z.string().min(2),
  summary: z.string().min(5),
  content: z.string().min(10),
  resourceLink: z.string().optional(),
  iconType: z.string().default('heart'),
  urgencyLevel: z.enum(['GENERAL', 'RECOMMENDED', 'URGENT']).default('GENERAL'),
});

/**
 * GET /api/recommendations
 * List active wellness resources, optional category filter
 */
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const category = req.query.category as string;
    const whereClause: any = { active: true };

    if (category && category !== 'ALL') {
      whereClause.category = category.toUpperCase();
    }

    const recommendations = await prisma.recommendation.findMany({
      where: whereClause,
      orderBy: [{ urgencyLevel: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ recommendations });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve recommendations' });
  }
});

/**
 * GET /api/recommendations/personalized
 * Get tailored recommendations for the current logged-in student based on their latest risk assessment
 */
router.get(
  '/personalized',
  authenticateJWT,
  requireRole(['STUDENT']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const studentId = req.user!.studentProfileId;
      if (!studentId) {
        res.status(400).json({ error: 'Student profile required' });
        return;
      }

      // Fetch latest risk assessment
      const latestRisk = await prisma.riskAssessment.findFirst({
        where: { studentId },
        orderBy: { generatedAt: 'desc' },
      });

      const primaryCategory = latestRisk?.primaryCategory || 'GENERAL';
      const riskLevel = latestRisk?.riskLevel || 'LOW';

      // Pull matching category items + general support + crisis if high risk
      const recommendations = await prisma.recommendation.findMany({
        where: {
          active: true,
          OR: [
            { category: primaryCategory },
            { category: 'GENERAL' },
            ...(riskLevel === 'NEEDS_ATTENTION' ? [{ category: 'CRISIS' }] : []),
          ],
        },
        orderBy: [{ urgencyLevel: 'desc' }, { createdAt: 'desc' }],
        take: 6,
      });

      res.json({
        primaryCategory,
        riskLevel,
        recommendations,
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve personalized recommendations' });
    }
  }
);

/**
 * POST /api/recommendations (Admin only)
 */
router.post(
  '/',
  authenticateJWT,
  requireRole(['ADMIN']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parseResult = recommendationSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.errors[0].message });
        return;
      }

      const rec = await prisma.recommendation.create({
        data: parseResult.data,
      });

      res.status(201).json({ message: 'Recommendation created', recommendation: rec });
    } catch (err) {
      res.status(500).json({ error: 'Failed to create recommendation' });
    }
  }
);

/**
 * DELETE /api/recommendations/:id (Admin only)
 */
router.delete(
  '/:id',
  authenticateJWT,
  requireRole(['ADMIN']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      await prisma.recommendation.delete({
        where: { id: req.params.id },
      });
      res.json({ message: 'Recommendation deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete recommendation' });
    }
  }
);

export default router;
