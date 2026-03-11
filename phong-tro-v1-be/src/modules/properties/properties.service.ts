import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreatePropertyDto, UpdatePropertyDto } from './dto/property.dto';

@Injectable()
export class PropertiesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createPropertyDto: CreatePropertyDto) {
    const property = await this.prisma.property.create({
      data: {
        ...createPropertyDto,
        ownerId: userId,
      },
    });

    return property;
  }

  async findAll(userId: string) {
    const properties = await this.prisma.property.findMany({
      where: { ownerId: userId },
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

    return properties;
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

    return property;
  }

  async update(id: string, userId: string, updatePropertyDto: UpdatePropertyDto) {
    await this.findOne(id, userId);

    const property = await this.prisma.property.update({
      where: { id },
      data: updatePropertyDto,
    });

    return property;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    await this.prisma.property.delete({
      where: { id },
    });

    return { message: 'Property deleted successfully' };
  }
}
