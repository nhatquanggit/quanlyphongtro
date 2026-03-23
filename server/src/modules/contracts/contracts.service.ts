import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { ContractStatus, RoomStatus, TenantStatus } from '@/common/constants/app-enums';
import {
  parseJsonFieldArray,
  parseJsonFields,
  serializeJsonFields,
} from '@/common/utils/json-field.util';
import { ContractQueryDto, CreateContractDto, UpdateContractDto } from './dto/contract.dto';

@Injectable()
export class ContractsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateContractDto) {
    const room = await this.prisma.room.findUnique({ where: { id: dto.roomId } });
    if (!room) throw new NotFoundException('Room not found');

    const tenant = await this.prisma.tenant.findUnique({ where: { id: dto.tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    if (room.propertyId !== dto.propertyId || tenant.propertyId !== dto.propertyId) {
      throw new BadRequestException('Room, tenant and property are not in the same property');
    }

    const activeContract = await this.prisma.contract.findFirst({
      where: {
        roomId: dto.roomId,
        status: ContractStatus.ACTIVE,
      },
    });

    if (activeContract) {
      throw new BadRequestException('Room already has an active contract');
    }

    const startDate = new Date(dto.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + dto.termMonths);

    const contract = await this.prisma.contract.create({
      data: {
        roomId: dto.roomId,
        tenantId: dto.tenantId,
        propertyId: dto.propertyId,
        startDate,
        endDate,
        monthlyRent: dto.monthlyRent ?? room.price,
        deposit: dto.deposit ?? room.deposit,
        electricityPrice: dto.electricityPrice ?? 3500,
        waterPrice: dto.waterPrice ?? 18000,
        services: dto.services ? JSON.stringify(dto.services) : undefined,
        status: ContractStatus.ACTIVE,
        signedDate: dto.signedDate ? new Date(dto.signedDate) : undefined,
        notes: dto.notes,
      },
      include: {
        room: true,
        tenant: true,
        property: true,
      },
    });

    await Promise.all([
      this.prisma.room.update({
        where: { id: dto.roomId },
        data: { status: RoomStatus.OCCUPIED },
      }),
      this.prisma.tenant.update({
        where: { id: dto.tenantId },
        data: { status: TenantStatus.ACTIVE },
      }),
    ]);

    return parseJsonFields(contract, ['services']);
  }

  async findAll(query: ContractQueryDto) {
    const { propertyId, status, tenantId, roomId, search, page = 1, limit = 20 } = query;

    const where: Record<string, unknown> = {};
    if (propertyId) where.propertyId = propertyId;
    if (status) where.status = status;
    if (tenantId) where.tenantId = tenantId;
    if (roomId) where.roomId = roomId;

    if (search) {
      where.OR = [
        { room: { roomNumber: { contains: search } } },
        { tenant: { fullName: { contains: search } } },
        { notes: { contains: search } },
      ];
    }

    const [contracts, total] = await Promise.all([
      this.prisma.contract.findMany({
        where,
        include: {
          room: { select: { id: true, roomNumber: true, floor: true, type: true } },
          tenant: { select: { id: true, fullName: true, phone: true, email: true } },
          property: { select: { id: true, name: true } },
        },
        orderBy: [{ createdAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.contract.count({ where }),
    ]);

    return {
      data: parseJsonFieldArray(contracts, ['services']),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const contract = await this.prisma.contract.findUnique({
      where: { id },
      include: {
        room: true,
        tenant: true,
        property: true,
      },
    });

    if (!contract) throw new NotFoundException('Contract not found');

    return parseJsonFields(contract, ['services']);
  }

  async update(id: string, dto: UpdateContractDto) {
    const existing = await this.findOne(id);

    const updateData = {
      ...serializeJsonFields(dto, ['services']),
      signedDate: dto.signedDate ? new Date(dto.signedDate) : undefined,
    } as Record<string, unknown>;

    const contract = await this.prisma.contract.update({
      where: { id },
      data: updateData,
      include: {
        room: true,
        tenant: true,
        property: true,
      },
    });

    if (dto.status === ContractStatus.TERMINATED || dto.status === ContractStatus.EXPIRED) {
      await this.prisma.room.update({
        where: { id: existing.roomId },
        data: { status: RoomStatus.VACANT },
      });
    }

    return parseJsonFields(contract, ['services']);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.contract.delete({ where: { id } });
    return { message: 'Contract deleted successfully' };
  }

  async getStats(propertyId?: string) {
    const where = propertyId ? { propertyId } : {};
    const endingSoonDate = new Date();
    endingSoonDate.setDate(endingSoonDate.getDate() + 30);

    const [total, active, expired, terminated, endingSoon] = await Promise.all([
      this.prisma.contract.count({ where }),
      this.prisma.contract.count({ where: { ...where, status: ContractStatus.ACTIVE } }),
      this.prisma.contract.count({ where: { ...where, status: ContractStatus.EXPIRED } }),
      this.prisma.contract.count({ where: { ...where, status: ContractStatus.TERMINATED } }),
      this.prisma.contract.count({
        where: {
          ...where,
          status: ContractStatus.ACTIVE,
          endDate: {
            gte: new Date(),
            lte: endingSoonDate,
          },
        },
      }),
    ]);

    return {
      total,
      active,
      expired,
      terminated,
      endingSoon,
    };
  }

  async getPrintableContract(id: string) {
    const contract = await this.findOne(id);

    const startDate = new Date(contract.startDate).toLocaleDateString('vi-VN');
    const endDate = new Date(contract.endDate).toLocaleDateString('vi-VN');

    const html = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <title>Hop dong thue phong</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 32px; color: #111827; }
    h1 { text-align: center; margin-bottom: 24px; }
    .meta { margin-bottom: 16px; }
    .meta p { margin: 6px 0; }
    .section { margin-top: 16px; line-height: 1.6; }
    .sign { margin-top: 48px; display: flex; justify-content: space-between; }
    .sign-box { width: 45%; text-align: center; }
  </style>
</head>
<body>
  <h1>HOP DONG THUE PHONG</h1>
  <div class="meta">
    <p><strong>Khu tro:</strong> ${contract.property?.name ?? ''}</p>
    <p><strong>Phong:</strong> ${contract.room?.roomNumber ?? ''}</p>
    <p><strong>Khach thue:</strong> ${contract.tenant?.fullName ?? ''}</p>
    <p><strong>So dien thoai:</strong> ${contract.tenant?.phone ?? ''}</p>
    <p><strong>Thoi han:</strong> Tu ${startDate} den ${endDate}</p>
    <p><strong>Tien phong:</strong> ${Number(contract.monthlyRent ?? 0).toLocaleString('vi-VN')} VND/thang</p>
    <p><strong>Tien coc:</strong> ${Number(contract.deposit ?? 0).toLocaleString('vi-VN')} VND</p>
    <p><strong>Tien dien:</strong> ${Number(contract.electricityPrice ?? 0).toLocaleString('vi-VN')} VND/kWh</p>
    <p><strong>Tien nuoc:</strong> ${Number(contract.waterPrice ?? 0).toLocaleString('vi-VN')} VND/m3</p>
  </div>
  <div class="section">
    <p>Hai ben dong y cac dieu khoan thue phong nhu tren va cam ket thuc hien dung noi dung hop dong.</p>
    <p><strong>Ghi chu:</strong> ${contract.notes ?? ''}</p>
  </div>
  <div class="sign">
    <div class="sign-box">
      <p><strong>BEN CHO THUE</strong></p>
      <p>(Ky va ghi ro ho ten)</p>
    </div>
    <div class="sign-box">
      <p><strong>BEN THUE</strong></p>
      <p>(Ky va ghi ro ho ten)</p>
    </div>
  </div>
</body>
</html>`;

    return {
      contract,
      html,
    };
  }
}
