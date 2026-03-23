import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateRoomDto, UpdateRoomDto, RoomQueryDto } from './dto/room.dto';
import { parseJsonFieldArray, parseJsonFields, serializeJsonFields } from '@/common/utils/json-field.util';

@Injectable()
export class RoomsService {
  constructor(private prisma: PrismaService) {}

  async create(createRoomDto: CreateRoomDto) {
    const createData = serializeJsonFields(createRoomDto, ['amenities', 'images']) as any;

    const room = await this.prisma.room.create({
      data: createData,
      include: { property: true },
    });

    return parseJsonFields(room, ['amenities', 'images']);
  }

  async findAll(query: RoomQueryDto) {
    const { propertyId, status, type, floor, search, page = 1, limit = 10 } = query;

    const where: any = {};

    if (propertyId) where.propertyId = propertyId;
    if (status) where.status = status;
    if (type) where.type = type;
    if (floor) where.floor = floor;

    if (search) {
      where.OR = [
        { roomNumber: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [rooms, total] = await Promise.all([
      this.prisma.room.findMany({
        where,
        include: {
          property: {
            select: { name: true, address: true },
          },
          contracts: {
            where: { status: 'ACTIVE' },
            include: { tenant: { select: { fullName: true, phone: true } } },
            take: 1,
          },
        },
        orderBy: [{ floor: 'asc' }, { roomNumber: 'asc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.room.count({ where }),
    ]);

    return {
      data: parseJsonFieldArray(rooms, ['amenities', 'images']),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const room = await this.prisma.room.findUnique({
      where: { id },
      include: {
        property: true,
        contracts: {
          include: { tenant: true },
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        maintenance: {
          take: 5,
          orderBy: { reportedDate: 'desc' },
        },
      },
    });

    if (!room) {
      throw new NotFoundException('Room not found');
    }

    return parseJsonFields(room, ['amenities', 'images']);
  }

  async update(id: string, updateRoomDto: UpdateRoomDto) {
    await this.findOne(id);

    const updateData = serializeJsonFields(updateRoomDto, ['amenities', 'images']) as any;

    const room = await this.prisma.room.update({
      where: { id },
      data: updateData,
    });

    return parseJsonFields(room, ['amenities', 'images']);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.room.delete({
      where: { id },
    });

    return { message: 'Room deleted successfully' };
  }

  async getStats(propertyId?: string) {
    const where = propertyId ? { propertyId } : {};

    const [total, occupied, vacant, maintenance] = await Promise.all([
      this.prisma.room.count({ where }),
      this.prisma.room.count({ where: { ...where, status: 'OCCUPIED' } }),
      this.prisma.room.count({ where: { ...where, status: 'VACANT' } }),
      this.prisma.room.count({ where: { ...where, status: 'MAINTENANCE' } }),
    ]);

    const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(2) : '0';

    // Get rooms by type
    const byType = await this.prisma.room.groupBy({
      by: ['type'],
      where,
      _count: true,
    });

    return {
      total,
      occupied,
      vacant,
      maintenance,
      occupancyRate: parseFloat(occupancyRate),
      byType: byType.map((item) => ({
        type: item.type,
        count: item._count,
      })),
    };
  }
}
