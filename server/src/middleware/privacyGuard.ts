import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { prisma } from '../db';

/**
 * Privacy Guard: Enforces strict Student Privacy boundaries
 * - Students can only access their own records
 * - Counselors can only access records of their assigned students
 * - Admins cannot access raw individual survey/mood records (strict aggregate-only policy)
 */
export const enforceStudentDataPrivacy = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const user = req.user;
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  // 1. Target student profile ID from params or query
  const targetStudentId = req.params.studentId || req.query.studentId as string;

  // If no specific studentId in params, verify student self-access
  if (!targetStudentId) {
    if (user.role === 'STUDENT' && !user.studentProfileId) {
      res.status(403).json({ error: 'Student profile missing' });
      return;
    }
    next();
    return;
  }

  // 2. Admins are blocked from individual student records (Strict Privacy Principle)
  if (user.role === 'ADMIN') {
    res.status(403).json({
      error: 'Privacy Violation: Administrative accounts have access to anonymized institution aggregates only. Individual student records are confidential.',
    });
    return;
  }

  // 3. Students can only access their own studentId
  if (user.role === 'STUDENT') {
    if (user.studentProfileId !== targetStudentId) {
      res.status(403).json({
        error: 'Forbidden: You are not authorized to view another student’s private records.',
      });
      return;
    }
    next();
    return;
  }

  // 4. Counselors can only access students assigned to them
  if (user.role === 'COUNSELOR') {
    const student = await prisma.studentProfile.findUnique({
      where: { id: targetStudentId },
      select: { assignedCounselorId: true },
    });

    if (!student) {
      res.status(404).json({ error: 'Student record not found' });
      return;
    }

    if (student.assignedCounselorId !== user.counselorProfileId) {
      res.status(403).json({
        error: 'Forbidden: You are not the assigned counselor for this student.',
      });
      return;
    }

    next();
    return;
  }

  res.status(403).json({ error: 'Forbidden' });
};
