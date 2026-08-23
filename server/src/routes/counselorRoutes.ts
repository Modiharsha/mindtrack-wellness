import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticateJWT, requireRole, AuthenticatedRequest } from '../middleware/auth';
import { enforceStudentDataPrivacy } from '../middleware/privacyGuard';

const router = Router();

const noteSchema = z.object({
  studentId: z.string().min(1),
  noteContent: z.string().min(1, 'Note cannot be empty'),
  isPrivate: z.boolean().default(true),
});

/**
 * GET /api/counselor/students
 * List all students assigned to the logged-in counselor with computed risk badges
 */
router.get(
  '/students',
  authenticateJWT,
  requireRole(['COUNSELOR']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const counselorProfileId = req.user!.counselorProfileId;
      if (!counselorProfileId) {
        res.status(400).json({ error: 'Counselor profile not found' });
        return;
      }

      const assignedStudents = await prisma.studentProfile.findMany({
        where: { assignedCounselorId: counselorProfileId },
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true, createdAt: true } },
          moodEntries: {
            orderBy: { entryDate: 'desc' },
            take: 7,
          },
          surveyResponses: {
            where: { isDraft: false },
            orderBy: { submittedAt: 'desc' },
            take: 1,
            include: { survey: { select: { title: true } } },
          },
          riskAssessments: {
            orderBy: { generatedAt: 'desc' },
            take: 1,
          },
          appointments: {
            where: { status: 'REQUESTED' },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });

      // Format response with triage priority
      const roster = assignedStudents.map(student => {
        const latestRisk = student.riskAssessments[0];
        const latestSurvey = student.surveyResponses[0];
        const recentMoods = student.moodEntries;

        const avg7DayMood =
          recentMoods.length > 0
            ? recentMoods.reduce((acc, curr) => acc + curr.moodValue, 0) / recentMoods.length
            : null;

        // Check for active low streak
        let lowStreak = 0;
        for (const m of recentMoods) {
          if (m.moodValue <= 2) lowStreak++;
          else break;
        }

        const riskLevel = latestRisk?.riskLevel || 'LOW';
        const compositeScore = latestRisk?.compositeScore || 15;

        return {
          studentProfileId: student.id,
          userId: student.user.id,
          name: student.user.name,
          email: student.user.email,
          program: student.program,
          graduationYear: student.graduationYear,
          consentGiven: student.consentGiven,
          riskLevel,
          compositeScore,
          primaryCategory: latestRisk?.primaryCategory || 'GENERAL',
          contributingFactors: latestRisk?.contributingFactors
            ? JSON.parse(latestRisk.contributingFactors)
            : [],
          lastRiskGeneratedAt: latestRisk?.generatedAt || student.createdAt,
          latestSurvey: latestSurvey
            ? {
                title: latestSurvey.survey.title,
                score: latestSurvey.score,
                riskLevel: latestSurvey.riskLevel,
                submittedAt: latestSurvey.submittedAt,
              }
            : null,
          avg7DayMood: avg7DayMood ? Number(avg7DayMood.toFixed(1)) : null,
          activeLowStreak: lowStreak,
          pendingAppointment: student.appointments.length > 0,
        };
      });

      // Sort by risk priority: NEEDS_ATTENTION first, then MODERATE, then LOW
      const riskWeight: Record<string, number> = {
        NEEDS_ATTENTION: 3,
        MODERATE: 2,
        LOW: 1,
      };

      roster.sort((a, b) => {
        const weightDiff = (riskWeight[b.riskLevel] || 0) - (riskWeight[a.riskLevel] || 0);
        if (weightDiff !== 0) return weightDiff;
        return (b.compositeScore || 0) - (a.compositeScore || 0);
      });

      res.json({ students: roster });
    } catch (err) {
      console.error('Counselor roster error:', err);
      res.status(500).json({ error: 'Failed to retrieve student roster' });
    }
  }
);

/**
 * GET /api/counselor/students/:studentId
 * Deep dive wellness profile for a single assigned student
 */
router.get(
  '/students/:studentId',
  authenticateJWT,
  requireRole(['COUNSELOR']),
  enforceStudentDataPrivacy,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const studentId = req.params.studentId;

      const student = await prisma.studentProfile.findUnique({
        where: { id: studentId },
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true, createdAt: true } },
          moodEntries: {
            orderBy: { entryDate: 'asc' },
            take: 30,
          },
          surveyResponses: {
            where: { isDraft: false },
            include: { survey: true },
            orderBy: { submittedAt: 'desc' },
          },
          riskAssessments: {
            orderBy: { generatedAt: 'desc' },
            take: 5,
          },
          appointments: {
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
          counselorNotes: {
            orderBy: { createdAt: 'desc' },
            include: { counselor: { select: { name: true } } },
          },
        },
      });

      if (!student) {
        res.status(404).json({ error: 'Student not found' });
        return;
      }

      const formattedMoods = student.moodEntries.map(m => ({
        id: m.id,
        moodValue: m.moodValue,
        emotionTags: m.emotionTags ? JSON.parse(m.emotionTags) : [],
        note: m.note,
        entryDate: m.entryDate,
      }));

      const formattedSurveys = student.surveyResponses.map(r => ({
        id: r.id,
        title: r.survey.title,
        category: r.survey.category,
        score: r.score,
        riskLevel: r.riskLevel,
        summary: r.summary,
        submittedAt: r.submittedAt,
        answers: JSON.parse(r.answers),
      }));

      const formattedRisk = student.riskAssessments.map(ra => ({
        id: ra.id,
        riskLevel: ra.riskLevel,
        compositeScore: ra.compositeScore,
        primaryCategory: ra.primaryCategory,
        contributingFactors: JSON.parse(ra.contributingFactors),
        triggerSource: ra.triggerSource,
        isResolved: ra.isResolved,
        generatedAt: ra.generatedAt,
      }));

      res.json({
        student: {
          id: student.id,
          userId: student.user.id,
          name: student.user.name,
          email: student.user.email,
          program: student.program,
          graduationYear: student.graduationYear,
          consentGiven: student.consentGiven,
          moodHistory: formattedMoods,
          surveyHistory: formattedSurveys,
          riskHistory: formattedRisk,
          appointments: student.appointments,
          notes: student.counselorNotes,
        },
      });
    } catch (err) {
      console.error('Student deep dive error:', err);
      res.status(500).json({ error: 'Failed to retrieve student profile' });
    }
  }
);

/**
 * POST /api/counselor/notes
 * Add a private counselor clinical note to a student record
 */
router.post(
  '/notes',
  authenticateJWT,
  requireRole(['COUNSELOR']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const parseResult = noteSchema.safeParse(req.body);
      if (!parseResult.success) {
        res.status(400).json({ error: parseResult.error.errors[0].message });
        return;
      }

      const { studentId, noteContent, isPrivate } = parseResult.data;

      // Verify student belongs to this counselor
      const student = await prisma.studentProfile.findUnique({
        where: { id: studentId },
      });

      if (!student || student.assignedCounselorId !== req.user!.counselorProfileId) {
        res.status(403).json({ error: 'Unauthorized: Student is not assigned to you' });
        return;
      }

      const note = await prisma.counselorNote.create({
        data: {
          counselorId: req.user!.userId,
          studentId,
          noteContent,
          isPrivate,
        },
      });

      res.status(201).json({ message: 'Note recorded successfully', note });
    } catch (err) {
      res.status(500).json({ error: 'Failed to record counselor note' });
    }
  }
);

/**
 * PUT /api/counselor/risk/:riskId/resolve
 * Mark a risk assessment as resolved/addressed by counselor
 */
router.put(
  '/risk/:riskId/resolve',
  authenticateJWT,
  requireRole(['COUNSELOR']),
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const risk = await prisma.riskAssessment.update({
        where: { id: req.params.riskId },
        data: {
          isResolved: true,
          resolvedAt: new Date(),
        },
      });

      res.json({ message: 'Risk assessment marked as resolved', risk });
    } catch (err) {
      res.status(500).json({ error: 'Failed to update risk assessment' });
    }
  }
);

export default router;
