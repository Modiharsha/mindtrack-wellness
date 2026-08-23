import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth';
import { NotificationService } from '../services/notificationService';

const router = Router();

const sendMessageSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  content: z.string().min(1, 'Message content cannot be empty').max(2000),
});

/**
 * POST /api/messages
 * Send a message to a student or counselor
 */
router.post('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const parseResult = sendMessageSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({ error: parseResult.error.errors[0].message });
      return;
    }

    const { receiverId, content } = parseResult.data;
    const senderId = req.user!.userId;

    // Verify recipient exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      res.status(404).json({ error: 'Recipient user not found' });
      return;
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
      },
      include: {
        sender: { select: { id: true, name: true, role: true, avatar: true } },
      },
    });

    // Notify receiver
    await NotificationService.sendNotification(
      receiverId,
      `New Message from ${req.user!.name}`,
      content.length > 60 ? `${content.substring(0, 60)}...` : content,
      'MESSAGE',
      req.user!.role === 'STUDENT' ? '/counselor/messages' : '/student/counselor'
    );

    res.status(201).json({ message });
  } catch (err) {
    console.error('Send message error:', err);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

/**
 * GET /api/messages/thread/:partnerId
 * Get conversation history with a specific partner
 */
router.get('/thread/:partnerId', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user!.userId;
    const partnerId = req.params.partnerId;

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: currentUserId, receiverId: partnerId },
          { senderId: partnerId, receiverId: currentUserId },
        ],
      },
      orderBy: { sentAt: 'asc' },
      include: {
        sender: { select: { id: true, name: true, role: true, avatar: true } },
      },
    });

    // Mark unread messages from partner as read
    await prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: currentUserId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    res.json({ messages });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve message thread' });
  }
});

/**
 * GET /api/messages/conversations
 * Get list of active conversation partners for current user
 */
router.get('/conversations', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const currentUserId = req.user!.userId;

    // Find all distinct users we exchanged messages with
    const sent = await prisma.message.findMany({
      where: { senderId: currentUserId },
      select: { receiverId: true },
      distinct: ['receiverId'],
    });

    const received = await prisma.message.findMany({
      where: { receiverId: currentUserId },
      select: { senderId: true },
      distinct: ['senderId'],
    });

    const partnerIds = Array.from(
      new Set([...sent.map(s => s.receiverId), ...received.map(r => r.senderId)])
    );

    const partners = await prisma.user.findMany({
      where: { id: { in: partnerIds } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        studentProfile: { select: { id: true, program: true } },
        counselorProfile: { select: { id: true, title: true } },
      },
    });

    // Get latest message for each partner
    const conversations = await Promise.all(
      partners.map(async p => {
        const lastMsg = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: currentUserId, receiverId: p.id },
              { senderId: p.id, receiverId: currentUserId },
            ],
          },
          orderBy: { sentAt: 'desc' },
        });

        const unreadCount = await prisma.message.count({
          where: {
            senderId: p.id,
            receiverId: currentUserId,
            readAt: null,
          },
        });

        return {
          partner: p,
          lastMessage: lastMsg,
          unreadCount,
        };
      })
    );

    res.json({ conversations });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve conversations' });
  }
});

export default router;
