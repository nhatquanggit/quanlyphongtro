import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateTenantDto, UpdateTenantDto } from './dto/tenant.dto';
import { parseJsonFieldArray, parseJsonFields, serializeJsonFields } from '@/common/utils/json-field.util';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async create(createTenantDto: CreateTenantDto) {
    const { dateOfBirth, ...rest } = createTenantDto;
    
    const tenant = await this.prisma.tenant.create({
      data: {
        ...serializeJsonFields(rest, ['emergencyContact']),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      },
      include: {
        property: {
          select: { name: true, address: true },
        },
      },
    });

    return parseJsonFields(tenant, ['emergencyContact']);
  }

  async findAll(propertyId?: string) {
    const where = propertyId ? { propertyId } : {};

    const tenants = await this.prisma.tenant.findMany({
      where,
      include: {
        property: {
          select: { name: true },
        },
        _count: {
          select: { contracts: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return parseJsonFieldArray(tenants, ['emergencyContact']);
  }

  async findOne(id: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id },
      include: {
        property: true,
        contracts: {
          include: {
            room: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        invoices: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return parseJsonFields(tenant, ['emergencyContact']);
  }

  async update(id: string, updateTenantDto: UpdateTenantDto) {
    await this.findOne(id);

    const { dateOfBirth, ...rest } = updateTenantDto;

    const tenant = await this.prisma.tenant.update({
      where: { id },
      data: {
        ...serializeJsonFields(rest, ['emergencyContact']),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      },
    });

    return parseJsonFields(tenant, ['emergencyContact']);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.tenant.delete({
      where: { id },
    });

    return { message: 'Tenant deleted successfully' };
  }
}
