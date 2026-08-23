import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload, UserRole } from '../types';
import { prisma } from '../db';

export interface AuthenticatedRequest extends Request {
  user?: JWTPayload;
}

const JWT_SECRET = process.env.JWT_SECRET || 'mindtrack_super_secure_jwt_secret_development_key_2026';

export const authenticateJWT = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Missing or invalid authorization token' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;

    // Verify user exists and check approval status for staff
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { studentProfile: true, counselorProfile: true },
    });

    if (!user) {
      res.status(401).json({ error: 'Unauthorized: User record not found' });
      return;
    }

    if (!user.isApproved && (user.role === 'COUNSELOR')) {
      res.status(403).json({ error: 'Forbidden: Counselor account is pending administrative approval' });
      return;
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role as UserRole,
      name: user.name,
      studentProfileId: user.studentProfile?.id,
      counselorProfileId: user.counselorProfile?.id,
    };

    next();
  } catch (err) {
    res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    return;
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized: Authentication required' });
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden: Access restricted to [${allowedRoles.join(', ')}]`,
      });
      return;
    }

    next();
  };
};
