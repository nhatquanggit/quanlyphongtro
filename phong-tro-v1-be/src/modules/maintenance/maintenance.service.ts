import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import {
  CreateMaintenanceDto,
  UpdateMaintenanceDto,
  AssignMaintenanceDto,
  CompleteMaintenanceDto,
  MaintenanceQueryDto,
} from './dto/maintenance.dto';
import { MaintenanceStatus } from '@prisma/client';

@Injectable()
export class MaintenanceService {
  constructor(private prisma: PrismaService) {}

  async create(createMaintenanceDto: CreateMaintenanceDto) {
    const maintenance = await this.prisma.maintenance.create({
      data: {
        ...createMaintenanceDto,
        status: MaintenanceStatus.PENDING,
      },
      include: {
        room: { select: { roomNumber: true, floor: true } },
        property: { select: { name: true } },
      },
    });

    // TODO: Send notification if urgency is HIGH
    // if (maintenance.urgency === 'HIGH') {
    //   await this.sendUrgentNotification(maintenance);
    // }

    return maintenance;
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
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { room: { roomNumber: { contains: search, mode: 'insensitive' } } },
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
      data: maintenance,
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

    return maintenance;
  }

  async update(id: string, updateMaintenanceDto: UpdateMaintenanceDto) {
    await this.findOne(id);

    const maintenance = await this.prisma.maintenance.update({
      where: { id },
      data: updateMaintenanceDto,
    });

    return maintenance;
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.maintenance.delete({
      where: { id },
    });

    return { message: 'Maintenance request deleted successfully' };
  }

  async assign(id: string, assignDto: AssignMaintenanceDto) {
    await this.findOne(id);

    const { assignedToId, scheduledDate } = assignDto;

    const maintenance = await this.prisma.maintenance.update({
      where: { id },
      data: {
        assignedToId,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : null,
        status: MaintenanceStatus.IN_PROGRESS,
      },
      include: {
        assignedTo: { select: { fullName: true, phone: true, email: true } },
      },
    });

    // TODO: Send notification to assigned worker
    // await this.sendAssignmentNotification(maintenance);

    return maintenance;
  }

  async complete(id: string, completeDto: CompleteMaintenanceDto) {
    await this.findOne(id);

    const { cost, notes } = completeDto;

    const maintenance = await this.prisma.maintenance.update({
      where: { id },
      data: {
        status: MaintenanceStatus.COMPLETED,
        completedDate: new Date(),
        cost,
        notes,
      },
    });

    // TODO: Send completion notification
    // await this.sendCompletionNotification(maintenance);

    return maintenance;
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
