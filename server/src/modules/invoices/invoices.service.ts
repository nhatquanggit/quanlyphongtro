import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto, MarkPaidDto, GenerateInvoicesDto, InvoiceQueryDto } from './dto/invoice.dto';
import { InvoiceStatus, type InvoiceStatus as InvoiceStatusValue } from '@/common/constants/app-enums';
import { parseJsonFieldArray, parseJsonFields, parseJsonValue, serializeJsonFields } from '@/common/utils/json-field.util';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(createInvoiceDto: CreateInvoiceDto) {
    const { dueDate, ...rest } = createInvoiceDto;

    // Calculate total amount
    const totalAmount = this.calculateTotalAmount(createInvoiceDto);

    const invoice = await this.prisma.invoice.create({
      data: {
        ...serializeJsonFields(rest, ['serviceCharges']),
        dueDate: new Date(dueDate),
        totalAmount,
        remainingAmount: totalAmount,
      },
      include: {
        tenant: { select: { fullName: true, phone: true, email: true } },
        room: { select: { roomNumber: true, floor: true } },
        contract: true,
      },
    });

    return parseJsonFields(invoice, ['serviceCharges']);
  }

  async findAll(query: InvoiceQueryDto) {
    const { propertyId, tenantId, roomId, status, billingMonth, search, page = 1, limit = 10 } = query;

    const where: any = {};

    if (propertyId) where.propertyId = propertyId;
    if (tenantId) where.tenantId = tenantId;
    if (roomId) where.roomId = roomId;
    if (status) where.status = status;
    if (billingMonth) where.billingMonth = billingMonth;

    if (search) {
      where.OR = [
        { tenant: { fullName: { contains: search } } },
        { room: { roomNumber: { contains: search } } },
      ];
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: {
          tenant: { select: { fullName: true, phone: true, email: true } },
          room: { select: { roomNumber: true, floor: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: parseJsonFieldArray(invoices, ['serviceCharges']),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        tenant: true,
        room: true,
        contract: true,
        property: { select: { name: true, address: true } },
        payments: { orderBy: { paymentDate: 'desc' } },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    return parseJsonFields(invoice, ['serviceCharges']);
  }

  async update(id: string, updateInvoiceDto: UpdateInvoiceDto) {
    const invoice = await this.findOne(id);

    const { dueDate, ...rest } = updateInvoiceDto;

    // Recalculate total if amounts changed
    let totalAmount: number | undefined;
    let remainingAmount: number | undefined;
    
    if (rest.rentAmount !== undefined || rest.electricityCost !== undefined || rest.waterCost !== undefined) {
      totalAmount = this.calculateTotalAmount({
        rentAmount: rest.rentAmount ?? invoice.rentAmount,
        electricityCost: rest.electricityCost ?? invoice.electricityCost,
        waterCost: rest.waterCost ?? invoice.waterCost,
        serviceCharges: rest.serviceCharges ?? invoice.serviceCharges,
      });
      remainingAmount = totalAmount - invoice.paidAmount;
    }

    const updatedInvoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        ...serializeJsonFields(rest, ['serviceCharges']),
        dueDate: dueDate ? new Date(dueDate) : undefined,
        totalAmount,
        remainingAmount,
      },
    });

    return parseJsonFields(updatedInvoice, ['serviceCharges']);
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.invoice.delete({
      where: { id },
    });

    return { message: 'Invoice deleted successfully' };
  }

  async markPaid(id: string, markPaidDto: MarkPaidDto) {
    const invoice = await this.findOne(id);

    const { paidAmount, paymentDate, paymentMethod, notes } = markPaidDto;

    const newPaidAmount = invoice.paidAmount + paidAmount;
    const remainingAmount = invoice.totalAmount - newPaidAmount;

    let status: InvoiceStatusValue;
    if (remainingAmount <= 0) {
      status = InvoiceStatus.PAID;
    } else if (newPaidAmount > 0) {
      status = InvoiceStatus.PARTIALLY_PAID;
    } else {
      status = InvoiceStatus.UNPAID;
    }

    // Update invoice
    const updatedInvoice = await this.prisma.invoice.update({
      where: { id },
      data: {
        paidAmount: newPaidAmount,
        remainingAmount: Math.max(0, remainingAmount),
        status,
        paymentDate: status === InvoiceStatus.PAID ? new Date(paymentDate) : invoice.paymentDate,
        paymentMethod: paymentMethod || invoice.paymentMethod,
        notes: notes || invoice.notes,
      },
    });

    // Create payment record
    await this.prisma.payment.create({
      data: {
        invoiceId: id,
        tenantId: invoice.tenantId,
        amount: paidAmount,
        paymentMethod: paymentMethod as any || 'CASH',
        paymentDate: new Date(paymentDate),
        notes,
      },
    });

    return parseJsonFields(updatedInvoice, ['serviceCharges']);
  }

  async generateInvoicesForAll(generateDto: GenerateInvoicesDto) {
    const { propertyId, billingMonth, dueDate } = generateDto;

    // Get all active contracts for the property
    const contracts = await this.prisma.contract.findMany({
      where: {
        propertyId,
        status: 'ACTIVE',
      },
      include: {
        room: true,
        tenant: true,
      },
    });

    if (contracts.length === 0) {
      throw new BadRequestException('No active contracts found for this property');
    }

    // Check if invoices already exist for this billing month
    const existingInvoices = await this.prisma.invoice.findMany({
      where: {
        propertyId,
        billingMonth,
      },
    });

    if (existingInvoices.length > 0) {
      throw new BadRequestException(`Invoices for ${billingMonth} already exist`);
    }

    // Generate invoices
    const invoices = await Promise.all(
      contracts.map((contract) =>
        this.prisma.invoice.create({
          data: {
            contractId: contract.id,
            tenantId: contract.tenantId,
            roomId: contract.roomId,
            propertyId: contract.propertyId,
            billingMonth,
            dueDate: new Date(dueDate),
            rentAmount: contract.monthlyRent,
            electricityUsage: 0,
            electricityCost: 0,
            waterUsage: 0,
            waterCost: 0,
            totalAmount: contract.monthlyRent,
            remainingAmount: contract.monthlyRent,
            status: InvoiceStatus.UNPAID,
          },
          include: {
            tenant: { select: { fullName: true } },
            room: { select: { roomNumber: true } },
          },
        }),
      ),
    );

    return {
      message: `Generated ${invoices.length} invoices successfully`,
      invoices: parseJsonFieldArray(invoices, ['serviceCharges']),
    };
  }

  async getStats(propertyId?: string) {
    const where = propertyId ? { propertyId } : {};

    const [totalInvoices, paidInvoices, unpaidInvoices, overdueInvoices, totalRevenue, totalUnpaid] = await Promise.all([
      this.prisma.invoice.count({ where }),
      this.prisma.invoice.count({ where: { ...where, status: InvoiceStatus.PAID } }),
      this.prisma.invoice.count({ where: { ...where, status: InvoiceStatus.UNPAID } }),
      this.prisma.invoice.count({
        where: {
          ...where,
          status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID] },
          dueDate: { lt: new Date() },
        },
      }),
      this.prisma.invoice.aggregate({
        where: { ...where, status: InvoiceStatus.PAID },
        _sum: { totalAmount: true },
      }),
      this.prisma.invoice.aggregate({
        where: { ...where, status: { not: InvoiceStatus.PAID } },
        _sum: { remainingAmount: true },
      }),
    ]);

    return {
      totalInvoices,
      paidInvoices,
      unpaidInvoices,
      overdueInvoices,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalUnpaid: totalUnpaid._sum.remainingAmount || 0,
      collectionRate: totalInvoices > 0 ? ((paidInvoices / totalInvoices) * 100).toFixed(2) : 0,
    };
  }

  private calculateTotalAmount(data: Partial<CreateInvoiceDto>): number {
    let total = data.rentAmount || 0;
    total += data.electricityCost || 0;
    total += data.waterCost || 0;

    const serviceCharges = typeof data.serviceCharges === 'string'
      ? parseJsonValue<Record<string, unknown>>(data.serviceCharges)
      : data.serviceCharges;

    // Add service charges if any
    if (serviceCharges && typeof serviceCharges === 'object') {
      Object.values(serviceCharges).forEach((charge: any) => {
        if (typeof charge === 'number') {
          total += charge;
        }
      });
    }

    return total;
  }
}
