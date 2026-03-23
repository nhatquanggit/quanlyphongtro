import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  CreateMaintenanceDto,
  UpdateMaintenanceDto,
  AssignMaintenanceDto,
  CompleteMaintenanceDto,
  MaintenanceQueryDto,
} from './dto/maintenance.dto';
import { MaintenanceStatus } from '@/common/constants/app-enums';
import { parseJsonFieldArray, parseJsonFields, serializeJsonFields } from '@/common/utils/json-field.util';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class MaintenanceService {
  constructor(
    private prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createMaintenanceDto: CreateMaintenanceDto) {
    const createData = {
      ...serializeJsonFields(createMaintenanceDto, ['images']),
      status: MaintenanceStatus.PENDING,
    } as any;

    const maintenance = await this.prisma.maintenance.create({
      data: createData,
      include: {
        room: { select: { roomNumber: true, floor: true } },
        property: { select: { name: true } },
      },
    });

    try {
      await this.notificationsService.notifyAdminsForMaintenance({
        title: createMaintenanceDto.title,
        roomId: createMaintenanceDto.roomId,
        propertyId: createMaintenanceDto.propertyId,
        reportedById: createMaintenanceDto.reportedById,
      });
    } catch {
      // Keep maintenance submission successful even if notification dispatch fails.
    }

    return parseJsonFields(maintenance, ['images']);
  }

  async findAll(query: MaintenanceQueryDto) {
    const { propertyId, roomId, status, urgency, type, search, page = 1, limit = 10 } = query;

    const where: any = {};

    if (propertyId) where.propertyId = propertyId;
    if (roomId) where.roomId = roomId;
    if (status) where.status = status;
    if (urgency) where.urgency = urgency;
    if (type) where.type = type;

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { room: { roomNumber: { contains: search } } },
      ];
    }

    const [maintenance, total] = await Promise.all([
      this.prisma.maintenance.findMany({
        where,
        include: {
          room: { select: { roomNumber: true, floor: true } },
          property: { select: { name: true } },
          assignedTo: { select: { fullName: true, phone: true } },
        },
        orderBy: [{ urgency: 'desc' }, { reportedDate: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.maintenance.count({ where }),
    ]);

    return {
      data: parseJsonFieldArray(maintenance, ['images']),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const maintenance = await this.prisma.maintenance.findUnique({
      where: { id },
      include: {
        room: true,
        property: { select: { name: true, address: true } },
        assignedTo: { select: { fullName: true, phone: true, email: true } },
      },
    });

    if (!maintenance) {
      throw new NotFoundException('Maintenance request not found');
    }

    return parseJsonFields(maintenance, ['images']);
  }

  async update(id: string, updateMaintenanceDto: UpdateMaintenanceDto) {
    await this.findOne(id);

    const maintenance = await this.prisma.maintenance.update({
      where: { id },
      data: serializeJsonFields(updateMaintenanceDto, ['images']),
    });

    return parseJsonFields(maintenance, ['images']);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.maintenance.delete({
      where: { id },
    });

    return { message: 'Maintenance request deleted successfully' };
  }

  async assign(id: string, assignDto: AssignMaintenanceDto) {
    const maintenance = await this.findOne(id);

    const { assignedToId, scheduledDate } = assignDto;

    const updated = await this.prisma.maintenance.update({
      where: { id },
      data: {
        assignedToId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        status: MaintenanceStatus.IN_PROGRESS,
      },
      include: {
        assignedTo: { select: { fullName: true, phone: true, email: true } },
        room: { select: { roomNumber: true } },
      },
    });

    try {
      await this.notificationsService.notifyMaintenanceAssigned(
        id,
        assignedToId,
        maintenance.title,
        updated.room?.roomNumber,
      );
    } catch {
      // Keep assignment successful even if notification fails
    }

    return parseJsonFields(updated, ['images']);
  }

  async complete(id: string, completeDto: CompleteMaintenanceDto) {
    const maintenance = await this.findOne(id);

    const { cost, notes } = completeDto;

    const updated = await this.prisma.maintenance.update({
      where: { id },
      data: {
        status: MaintenanceStatus.COMPLETED,
        completedDate: new Date(),
        cost,
        notes,
      },
      include: {
        room: { select: { roomNumber: true } },
      },
    });

    try {
      await this.notificationsService.notifyMaintenanceCompleted(
        id,
        maintenance.title,
        updated.room?.roomNumber,
      );
    } catch {
      // Keep completion successful even if notification fails
    }

    return parseJsonFields(updated, ['images']);
  }

  async getStats(propertyId?: string) {
    const where = propertyId ? { propertyId } : {};

    const [total, pending, inProgress, completed, highUrgency, totalCost] = await Promise.all([
      this.prisma.maintenance.count({ where }),
      this.prisma.maintenance.count({ where: { ...where, status: MaintenanceStatus.PENDING } }),
      this.prisma.maintenance.count({ where: { ...where, status: MaintenanceStatus.IN_PROGRESS } }),
      this.prisma.maintenance.count({ where: { ...where, status: MaintenanceStatus.COMPLETED } }),
      this.prisma.maintenance.count({ where: { ...where, urgency: 'HIGH', status: { not: MaintenanceStatus.COMPLETED } } }),
      this.prisma.maintenance.aggregate({
        where: { ...where, status: MaintenanceStatus.COMPLETED },
        _sum: { cost: true },
      }),
    ]);

    // Get maintenance by type
    const byType = await this.prisma.maintenance.groupBy({
      by: ['type'],
      where,
      _count: true,
    });

    return {
      total,
      pending,
      inProgress,
      completed,
      highUrgency,
      totalCost: totalCost._sum.cost || 0,
      byType: byType.map((item) => ({
        type: item.type,
        count: item._count,
      })),
    };
  }
}
