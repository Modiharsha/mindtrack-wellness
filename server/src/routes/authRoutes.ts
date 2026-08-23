import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import { JWTPayload, UserRole } from '../types';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'mindtrack_super_secure_jwt_secret_development_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['STUDENT', 'COUNSELOR', 'ADMIN']).default('STUDENT'),
  program: z.string().optional(),
  graduationYear: z.number().optional(),
  department: z.string().optional(),
  title: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Helper to generate token
function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * POST /api/auth/signup
 */
router.post('/signup', async (req, res: Response): Promise<void> => {
  try {
    const parseResult = signupSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { name, email, password, role, program, graduationYear, department, title } = parseResult.data;

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      res.status(400).json({ error: 'An account with this email address already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);
    // Staff accounts default to approved in dev, but can be set to false
    const isApproved = role === 'STUDENT' || role === 'ADMIN';

    // Auto-assign first available counselor if student
    let assignedCounselorId: string | null = null;
    if (role === 'STUDENT') {
      const defaultCounselor = await prisma.counselorProfile.findFirst();
      if (defaultCounselor) {
        assignedCounselorId = defaultCounselor.id;
      }
    }

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
        isApproved,
        studentProfile:
          role === 'STUDENT'
            ? {
                create: {
                  program: program || 'Undergraduate',
                  graduationYear: graduationYear || 2027,
                  assignedCounselorId: assignedCounselorId,
                  consentGiven: false,
                },
              }
            : undefined,
        counselorProfile:
          role === 'COUNSELOR'
            ? {
                create: {
                  department: department || 'Student Counseling Center',
                  title: title || 'Licensed Counselor',
                  officeHours: 'Mon-Fri, 9am - 4pm',
                },
              }
            : undefined,
      },
      include: {
        studentProfile: { include: { counselor: { include: { user: true } } } },
        counselorProfile: true,
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      name: user.name,
      studentProfileId: user.studentProfile?.id,
      counselorProfileId: user.counselorProfile?.id,
    });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        studentProfile: user.studentProfile,
        counselorProfile: user.counselorProfile,
      },
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Failed to create account. Please try again.' });
  }
});

/**
 * POST /api/auth/login
 */
router.post('/login', async (req, res: Response): Promise<void> => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { email, password } = parseResult.data;
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        studentProfile: { include: { counselor: { include: { user: true } } } },
        counselorProfile: true,
      },
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      name: user.name,
      studentProfileId: user.studentProfile?.id,
      counselorProfileId: user.counselorProfile?.id,
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        studentProfile: user.studentProfile,
        counselorProfile: user.counselorProfile,
      },
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

/**
 * GET /api/auth/me
 */
router.get('/me', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      include: {
        studentProfile: {
          include: {
            counselor: {
              include: { user: { select: { id: true, name: true, email: true, avatar: true } } },
            },
          },
        },
        counselorProfile: true,
      },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        avatar: user.avatar,
        studentProfile: user.studentProfile,
        counselorProfile: user.counselorProfile,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
});

/**
 * POST /api/auth/consent
 * Submits student consent for privacy policy and wellness monitoring onboarding
 */
router.post('/consent', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (req.user!.role !== 'STUDENT' || !req.user!.studentProfileId) {
      res.status(403).json({ error: 'Only student accounts submit consent' });
      return;
    }

    const updated = await prisma.studentProfile.update({
      where: { id: req.user!.studentProfileId },
      data: {
        consentGiven: true,
        consentDate: new Date(),
      },
    });

    res.json({ message: 'Consent recorded successfully', studentProfile: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to record consent' });
  }
});

/**
 * GET /api/auth/counselors
 * Returns list of counselors (for assignment or student selection)
 */
router.get('/counselors', authenticateJWT, async (_req, res: Response): Promise<void> => {
  try {
    const counselors = await prisma.counselorProfile.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });
    res.json({ counselors });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch counselors' });
  }
});

export default router;
