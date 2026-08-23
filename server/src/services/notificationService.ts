import { prisma } from '../db';

export class NotificationService {
  /**
   * Send an in-app notification to a user.
   */
  public static async sendNotification(
    userId: string,
    title: string,
    message: string,
    type: 'ALERT' | 'APPOINTMENT' | 'MESSAGE' | 'SURVEY_REMINDER' | 'RESOURCE' = 'INFO',
    linkUrl?: string
  ) {
    try {
      return await prisma.notification.create({
        data: {
          userId,
          title,
          message,
          type,
          linkUrl,
        },
      });
    } catch (err) {
      console.error('[NotificationService] Failed to send notification:', err);
    }
  }

  /**
   * When a student enters NEEDS_ATTENTION, alert their assigned counselor
   * and optionally send an empathetic resource prompt to the student.
   */
  public static async notifyCounselorOfRiskFlag(
    studentId: string,
    studentName: string,
    riskLevel: string,
    contributingFactors: string[]
  ) {
    try {
      // Find student profile and assigned counselor
      const studentProfile = await prisma.studentProfile.findUnique({
        where: { id: studentId },
        include: { counselor: { include: { user: true } }, user: true },
      });

      if (!studentProfile) return;

      // 1. Notify assigned counselor
      if (studentProfile.counselor?.user) {
        const counselorUserId = studentProfile.counselor.user.id;
        await prisma.notification.create({
          data: {
            userId: counselorUserId,
            title: `Wellness Check-In Recommended: ${studentName || studentProfile.user.name}`,
            message: `A student on your caseload has entered ${riskLevel.replace('_', ' ')}. Factors: ${contributingFactors.slice(0, 2).join('; ')}`,
            type: 'ALERT',
            linkUrl: `/counselor/students/${studentId}`,
          },
        });
      }

      // 2. Notify student with gentle, caring prompt
      await prisma.notification.create({
        data: {
          userId: studentProfile.userId,
          title: 'Gentle Check-In & Resources',
          message: 'Things can feel overwhelming sometimes. Support is available whenever you are ready.',
          type: 'RESOURCE',
          linkUrl: '/student/support',
        },
      });
    } catch (err) {
      console.error('[NotificationService] Risk flag notification error:', err);
    }
  }
}
