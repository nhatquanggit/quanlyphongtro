import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { TenantEventDto, TenantEventType } from './dto/notification.dto';

interface AdminNotificationPayload {
  type: string;
  title: string;
  message: string;
  link?: string;
}

interface MaintenanceNotificationInput {
  title: string;
  roomId: string;
  propertyId: string;
  reportedById?: string;
}

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findForUser(userId: string, limit = 10) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Math.max(1, Math.min(limit, 50)),
    });
  }

  async getUnreadCount(userId: string) {
    const unread = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { unread };
  }

  async markAsRead(userId: string, notificationId: string) {
    const existing = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { updated: result.count };
  }

  async notifyAdminsForMaintenance(input: MaintenanceNotificationInput) {
    const [room, property, reporter] = await Promise.all([
      this.prisma.room.findUnique({ where: { id: input.roomId }, select: { roomNumber: true } }),
      this.prisma.property.findUnique({ where: { id: input.propertyId }, select: { name: true } }),
      input.reportedById
        ? this.prisma.user.findUnique({
            where: { id: input.reportedById },
            select: { fullName: true, email: true },
          })
        : Promise.resolve(null),
    ]);

    const reporterName = reporter?.fullName || reporter?.email || 'Khach thue';
    const roomLabel = room?.roomNumber || 'N/A';
    const propertyLabel = property?.name || 'He thong';

    await this.createForAdminUsers({
      type: 'MAINTENANCE',
      title: 'Bao cao su co moi',
      message: `${reporterName} vua gui su co "${input.title}" (Phong ${roomLabel}, ${propertyLabel}).`,
      link: '/maintenance',
    });
  }

  async notifyTenantEvent(tenantUserId: string, event: TenantEventDto) {
    const sender = await this.prisma.user.findUnique({
      where: { id: tenantUserId },
      select: { fullName: true, email: true },
    });

    const senderName = sender?.fullName || sender?.email || 'Khach thue';

    if (event.eventType === TenantEventType.CHAT_MESSAGE) {
      await this.createForAdminUsers({
        type: 'CHAT',
        title: event.title || 'Tin nhan moi tu khach thue',
        message: event.message
          ? `${senderName}: ${event.message}`
          : `${senderName} vua gui tin nhan moi.`,
        link: event.link || '/chat',
      });
      return { ok: true };
    }

    if (event.eventType === TenantEventType.RENTAL_REQUEST) {
      const roomInfo = event.roomNumber ? ` phong ${event.roomNumber}` : '';
      await this.createForAdminUsers({
        type: 'RENTAL_REQUEST',
        title: event.title || 'Yeu cau thue phong moi',
        message: event.message || `${senderName} vua gui yeu cau thue${roomInfo}.`,
        link: event.link || '/room-management',
      });
      return { ok: true };
    }

    await this.createForAdminUsers({
      type: 'SYSTEM',
      title: event.title || 'Thong bao moi',
      message: event.message || `${senderName} vua gui mot thong bao moi.`,
      link: event.link,
    });

    return { ok: true };
  }

  async notifyMaintenanceAssigned(maintenanceId: string, assignedToId: string, title: string, roomNumber?: string) {
    const assignedUser = await this.prisma.user.findUnique({
      where: { id: assignedToId },
      select: { fullName: true, email: true },
    });

    const assignedName = assignedUser?.fullName || assignedUser?.email || 'Nhan vien';
    const roomLabel = roomNumber ? ` phong ${roomNumber}` : '';

    // Notify the assigned worker
    await this.prisma.notification.create({
      data: {
        userId: assignedToId,
        type: 'MAINTENANCE',
        title: 'Phan cong bao tri moi',
        message: `Ban vua duoc phan cong bao tri: "${title}"${roomLabel}.`,
        link: `/maintenance/${maintenanceId}`,
      },
    });

    // Notify admins
    await this.createForAdminUsers({
      type: 'MAINTENANCE',
      title: 'Phan cong bao tri',
      message: `${assignedName} vua duoc phan cong bao tri: "${title}"${roomLabel}.`,
      link: `/maintenance/${maintenanceId}`,
    });
  }

  async notifyMaintenanceCompleted(maintenanceId: string, title: string, roomNumber?: string) {
    await this.createForAdminUsers({
      type: 'MAINTENANCE',
      title: 'Hoan thanh bao tri',
      message: `Bao tri "${title}"${roomNumber ? ` phong ${roomNumber}` : ''} da hoan thanh.`,
      link: `/maintenance/${maintenanceId}`,
    });
  }

  private async createForAdminUsers(payload: AdminNotificationPayload) {
    const admins = await this.prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'MANAGER', 'STAFF'],
        },
      },
      select: { id: true },
    });

    if (admins.length === 0) return;

    await this.prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        link: payload.link,
      })),
    });
  }
}
