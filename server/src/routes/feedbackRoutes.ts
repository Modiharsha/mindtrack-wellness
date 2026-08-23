import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticateJWT, requireRole, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  category: z.enum([
    'APP_USABILITY',
    'COUNSELOR_SUPPORT',
    'SURVEY_EXPERIENCE',
    'RESOURCE_RELEVANCE',
    'SUGGESTION',
    'GENERAL',
  ]).default('GENERAL'),
  comment: z.string().min(3, 'Comment must be at least 3 characters').max(1500),
  isAnonymous: z.boolean().default(false),
});

/**
 * POST /api/feedback
 * Submit student / counselor / user feedback
 */
router.post('/', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = feedbackSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { rating, category, comment, isAnonymous } = parseResult.data;

    // Optional auth extraction from token header if logged in
    let userId: string | null = null;
    let userName: string | null = null;
    let userEmail: string | null = null;
    let userRole: string = 'STUDENT';

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET || 'mindtrack_super_secure_jwt_secret_development_key_2026'
        ) as any;
        userId = decoded.userId;
        userName = decoded.name;
        userEmail = decoded.email;
        userRole = decoded.role;
      } catch (e) {
        // Continue as unauthenticated / guest
      }
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: isAnonymous ? null : userId,
        userName: isAnonymous ? 'Anonymous Student' : userName || 'Community Member',
        userEmail: isAnonymous ? null : userEmail,
        userRole: userRole,
        rating,
        category,
        comment,
        isAnonymous,
        status: 'NEW',
      },
    });

    res.status(201).json({
      message: 'Feedback submitted successfully! Thank you for helping us improve MindTrack.',
      feedback,
    });
  } catch (err: any) {
    console.error('Submit feedback error:', err);
    res.status(500).json({ error: 'Failed to record feedback' });
  }
});

/**
 * GET /api/feedback/my
 * View feedback submitted by current user
 */
router.get('/my', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ feedbacks });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve feedback history' });
  }
});

/**
 * GET /api/feedback/admin
 * Admin list all feedbacks + rating metrics
 */
router.get(
  '/admin',
  authenticateJWT,
  requireRole(['ADMIN']),
  async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const feedbacks = await prisma.feedback.findMany({
        orderBy: { createdAt: 'desc' },
      });

      const totalCount = feedbacks.length;
      const avgRating =
        totalCount > 0
          ? Number((feedbacks.reduce((acc, f) => acc + f.rating, 0) / totalCount).toFixed(1))
          : 5.0;

      const categoryBreakdown: Record<string, number> = {};
      feedbacks.forEach(f => {
        categoryBreakdown[f.category] = (categoryBreakdown[f.category] || 0) + 1;
      });

      res.json({
        stats: {
          totalCount,
          avgRating,
          categoryBreakdown,
        },
        feedbacks,
      });
    } catch (err) {
      res.status(500).json({ error: 'Failed to retrieve admin feedback metrics' });
    }
  }
);

/**
 * PUT /api/feedback/:id/status
 * Admin update feedback status (REVIEWED, ACTIONED)
 */
router.put(
  '/:id/status',
  authenticateJWT,
  requireRole(['ADMIN']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const { status } = req.body;
      const updated = await prisma.feedback.update({
        where: { id: req.params.id },
        data: { status },
      });

      res.json({ message: 'Feedback status updated', feedback: updated });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update feedback status' });
    }
  }
);

export default router;
