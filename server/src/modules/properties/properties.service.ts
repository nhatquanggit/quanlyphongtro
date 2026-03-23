import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';
import { parseJsonFieldArray, parseJsonFields, serializeJsonFields } from '@/common/utils/json-field.util';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createPropertyDto: CreatePropertyDto) {
    const property = await this.prisma.property.create({
      data: {
        ...serializeJsonFields(createPropertyDto, ['settings']),
        ownerId: userId,
      },
    });

    return parseJsonFields(property, ['settings']);
  }

  async findAll(userId: string, role?: string) {
    const where = role === 'ADMIN' ? {} : { ownerId: userId };

    const properties = await this.prisma.property.findMany({
      where,
      include: {
        _count: {
          select: {
            rooms: true,
            tenants: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return parseJsonFieldArray(properties, ['settings']);
  }

  async findOne(id: string, userId: string) {
    const property = await this.prisma.property.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            rooms: true,
            tenants: true,
            contracts: true,
          },
        },
      },
    });

    if (!property) {
      throw new NotFoundException('Property not found');
    }

    if (property.ownerId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return parseJsonFields(property, ['settings']);
  }

  async update(id: string, userId: string, updatePropertyDto: UpdatePropertyDto) {
    await this.findOne(id, userId);

    const property = await this.prisma.property.update({
      where: { id },
      data: serializeJsonFields(updatePropertyDto, ['settings']),
    });

    return parseJsonFields(property, ['settings']);
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    await this.prisma.property.delete({
      where: { id },
    });

    return { message: 'Property deleted successfully' };
  }
}
