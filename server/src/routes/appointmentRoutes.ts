import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import { NotificationService } from '../services/notificationService';

const router = Router();

const requestAppointmentSchema = z.object({
  counselorId: z.string().optional(),
  requestedSlot: z.string().min(3, 'Please suggest a preferred day or time slot'),
  studentNotes: z.string().max(1000).optional(),
});

const updateAppointmentSchema = z.object({
  status: z.enum(['REQUESTED', 'CONFIRMED', 'COMPLETED', 'CANCELLED']),
  scheduledAt: z.string().optional(),
  counselorNotes: z.string().optional(),
  meetingLink: z.string().optional(),
});

/**
 * POST /api/appointments/request
 * Student requests a wellness check-in
 */
router.post('/request', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentProfileId = req.user!.studentProfileId;
    if (!studentProfileId) {
      res.status(400).json({ error: 'Only student accounts can request check-ins' });
      return;
    }

    const parseResult = requestAppointmentSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { requestedSlot, studentNotes } = parseResult.data;

    // Get student profile and assigned counselor
    const student = await prisma.studentProfile.findUnique({
      where: { id: studentProfileId },
      include: { counselor: { include: { user: true } }, user: true },
    });

    if (!student) {
      res.status(404).json({ error: 'Student profile not found' });
      return;
    }

    let targetCounselorId = parseResult.data.counselorId || student.assignedCounselorId;

    // If still no counselor assigned, find any available counselor
    if (!targetCounselorId) {
      const anyCounselor = await prisma.counselorProfile.findFirst();
      if (anyCounselor) {
        targetCounselorId = anyCounselor.id;
        // update assignment
        await prisma.studentProfile.update({
          where: { id: studentProfileId },
          data: { assignedCounselorId: anyCounselor.id },
        });
      }
    }

    if (!targetCounselorId) {
      res.status(400).json({ error: 'No counselors available in the system at this time' });
      return;
    }

    const appointment = await prisma.appointment.create({
      data: {
        studentId: studentProfileId,
        counselorId: targetCounselorId,
        status: 'REQUESTED',
        requestedSlot,
        studentNotes,
      },
      include: {
        counselor: { include: { user: true } },
        student: { include: { user: true } },
      },
    });

    // Notify Counselor
    if (appointment.counselor?.user) {
      await NotificationService.sendNotification(
        appointment.counselor.user.id,
        `New Check-In Request: ${student.user.name}`,
        `Requested slot: ${requestedSlot}. Notes: ${studentNotes || 'No specific notes provided.'}`,
        'APPOINTMENT',
        '/counselor/appointments'
      );
    }

    res.status(201).json({
      message: 'Appointment requested successfully. Your counselor has been notified.',
      appointment,
    });
  } catch (err) {
    console.error('Request appointment error:', err);
    res.status(500).json({ error: 'Failed to request appointment' });
  }
});

/**
 * GET /api/appointments
 * List appointments for current user (either Student or Counselor)
 */
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { role, studentProfileId, counselorProfileId } = req.user!;

    let appointments;

    if (role === 'STUDENT' && studentProfileId) {
      appointments = await prisma.appointment.findMany({
        where: { studentId: studentProfileId },
        include: {
          counselor: { include: { user: { select: { name: true, email: true, avatar: true } } } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else if (role === 'COUNSELOR' && counselorProfileId) {
      appointments = await prisma.appointment.findMany({
        where: { counselorId: counselorProfileId },
        include: {
          student: { include: { user: { select: { name: true, email: true, avatar: true } } } },
        },
        orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      });
    } else if (role === 'ADMIN') {
      appointments = await prisma.appointment.findMany({
        include: {
          counselor: { include: { user: { select: { name: true } } } },
          student: { include: { user: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    } else {
      appointments = [];
    }

    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve appointments' });
  }
});

/**
 * PUT /api/appointments/:id/status
 * Update appointment status (Confirm, Reschedule, Complete, Cancel)
 */
router.put('/:id/status', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = updateAppointmentSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { status, scheduledAt, counselorNotes, meetingLink } = parseResult.data;

    const existing = await prisma.appointment.findUnique({
      where: { id: req.params.id },
      include: {
        student: { include: { user: true } },
        counselor: { include: { user: true } },
      },
    });

    if (!existing) {
      res.status(404).json({ error: 'Appointment not found' });
      return;
    }

    const updated = await prisma.appointment.update({
      where: { id: req.params.id },
      data: {
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : existing.scheduledAt,
        counselorNotes: counselorNotes !== undefined ? counselorNotes : existing.counselorNotes,
        meetingLink: meetingLink !== undefined ? meetingLink : existing.meetingLink,
      },
      include: {
        counselor: { include: { user: true } },
        student: { include: { user: true } },
      },
    });

    // Notify Student
    if (existing.student?.user) {
      await NotificationService.sendNotification(
        existing.student.user.id,
        `Appointment Update: ${status}`,
        `Your check-in status is now ${status}.${meetingLink ? ` Meeting link: ${meetingLink}` : ''}`,
        'APPOINTMENT',
        '/student/counselor'
      );
    }

    res.json({ message: 'Appointment updated successfully', appointment: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

export default router;
