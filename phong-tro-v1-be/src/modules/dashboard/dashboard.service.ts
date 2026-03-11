import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { RoomStatus, InvoiceStatus, MaintenanceStatus, TenantStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getKPIs(propertyId?: string) {
    const where = propertyId ? { propertyId } : {};

    // Room statistics
    const [totalRooms, occupiedRooms, vacantRooms, maintenanceRooms] = await Promise.all([
      this.prisma.room.count({ where }),
      this.prisma.room.count({ where: { ...where, status: RoomStatus.OCCUPIED } }),
      this.prisma.room.count({ where: { ...where, status: RoomStatus.VACANT } }),
      this.prisma.room.count({ where: { ...where, status: RoomStatus.MAINTENANCE } }),
    ]);

    // Tenant statistics
    const [totalTenants, activeTenants, endingSoonTenants] = await Promise.all([
      this.prisma.tenant.count({ where }),
      this.prisma.tenant.count({ where: { ...where, status: TenantStatus.ACTIVE } }),
      this.prisma.tenant.count({ where: { ...where, status: TenantStatus.ENDING_SOON } }),
    ]);

    // Invoice statistics
    const [unpaidInvoices, overdueInvoices, totalUnpaid] = await Promise.all([
      this.prisma.invoice.count({
        where: { ...where, status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID] } },
      }),
      this.prisma.invoice.count({
        where: {
          ...where,
          status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID] },
          dueDate: { lt: new Date() },
        },
      }),
      this.prisma.invoice.aggregate({
        where: { ...where, status: { not: InvoiceStatus.PAID } },
        _sum: { remainingAmount: true },
      }),
    ]);

    // Maintenance statistics
    const [pendingMaintenance, highUrgencyMaintenance] = await Promise.all([
      this.prisma.maintenance.count({
        where: { ...where, status: { in: [MaintenanceStatus.PENDING, MaintenanceStatus.IN_PROGRESS] } },
      }),
      this.prisma.maintenance.count({
        where: { ...where, urgency: 'HIGH', status: { not: MaintenanceStatus.COMPLETED } },
      }),
    ]);

    // Calculate occupancy rate
    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : 0;

    return {
      rooms: {
        total: totalRooms,
        occupied: occupiedRooms,
        vacant: vacantRooms,
        maintenance: maintenanceRooms,
        occupancyRate: parseFloat(occupancyRate as string),
      },
      tenants: {
        total: totalTenants,
        active: activeTenants,
        endingSoon: endingSoonTenants,
      },
      invoices: {
        unpaid: unpaidInvoices,
        overdue: overdueInvoices,
        totalUnpaid: totalUnpaid._sum.remainingAmount || 0,
      },
      maintenance: {
        pending: pendingMaintenance,
        highUrgency: highUrgencyMaintenance,
      },
    };
  }

  async getRecentActivities(propertyId?: string, limit: number = 10) {
    const where = propertyId ? { propertyId } : {};

    const activities = await this.prisma.activityLog.findMany({
      where,
      include: {
        user: { select: { fullName: true, avatar: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return activities;
  }

  async getAlerts(propertyId?: string) {
    const where = propertyId ? { propertyId } : {};

    // Get overdue invoices
    const overdueInvoices = await this.prisma.invoice.findMany({
      where: {
        ...where,
        status: { in: [InvoiceStatus.UNPAID, InvoiceStatus.PARTIALLY_PAID] },
        dueDate: { lt: new Date() },
      },
      include: {
        tenant: { select: { fullName: true } },
        room: { select: { roomNumber: true } },
      },
      take: 5,
      orderBy: { dueDate: 'asc' },
    });

    // Get high urgency maintenance
    const urgentMaintenance = await this.prisma.maintenance.findMany({
      where: {
        ...where,
        urgency: 'HIGH',
        status: { not: MaintenanceStatus.COMPLETED },
      },
      include: {
        room: { select: { roomNumber: true } },
      },
      take: 5,
      orderBy: { reportedDate: 'desc' },
    });

    // Get contracts ending soon (within 30 days)
    const endingSoonDate = new Date();
    endingSoonDate.setDate(endingSoonDate.getDate() + 30);

    const endingContracts = await this.prisma.contract.findMany({
      where: {
        ...where,
        status: 'ACTIVE',
        endDate: {
          gte: new Date(),
          lte: endingSoonDate,
        },
      },
      include: {
        tenant: { select: { fullName: true, phone: true } },
        room: { select: { roomNumber: true } },
      },
      take: 5,
      orderBy: { endDate: 'asc' },
    });

    return {
      overdueInvoices: overdueInvoices.map((inv) => ({
        id: inv.id,
        tenant: inv.tenant.fullName,
        room: inv.room.roomNumber,
        amount: inv.remainingAmount,
        dueDate: inv.dueDate,
        daysOverdue: Math.floor((new Date().getTime() - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
      })),
      urgentMaintenance: urgentMaintenance.map((maint) => ({
        id: maint.id,
        room: maint.room.roomNumber,
        title: maint.title,
        type: maint.type,
        reportedDate: maint.reportedDate,
      })),
      endingContracts: endingContracts.map((contract) => ({
        id: contract.id,
        tenant: contract.tenant.fullName,
        phone: contract.tenant.phone,
        room: contract.room.roomNumber,
        endDate: contract.endDate,
        daysRemaining: Math.floor((contract.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      })),
    };
  }

  async getRevenueChart(propertyId?: string, months: number = 6) {
    const where = propertyId ? { propertyId } : {};

    // Get revenue for the last N months
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const invoices = await this.prisma.invoice.findMany({
      where: {
        ...where,
        status: InvoiceStatus.PAID,
        paymentDate: { gte: startDate, not: null },
      },
      select: {
        totalAmount: true,
        paymentDate: true,
      },
    });

    // Group by month
    const revenueByMonth: { [key: string]: number } = {};

    invoices.forEach((invoice) => {
      if (invoice.paymentDate) {
        const month = invoice.paymentDate.toISOString().substring(0, 7); // YYYY-MM
        revenueByMonth[month] = (revenueByMonth[month] || 0) + invoice.totalAmount;
      }
    });

    // Fill in missing months with 0
    const result: Array<{ month: string; revenue: number }> = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toISOString().substring(0, 7);
      result.push({
        month,
        revenue: revenueByMonth[month] || 0,
      });
    }

    return result;
  }

  async getOccupancyTrend(propertyId?: string, months: number = 6) {
    const where = propertyId ? { propertyId } : {};

    // This is a simplified version - in production, you'd want to track historical data
    const totalRooms = await this.prisma.room.count({ where });
    const occupiedRooms = await this.prisma.room.count({ where: { ...where, status: RoomStatus.OCCUPIED } });

    const occupancyRate = totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : '0';

    // Generate mock trend data (in production, use historical data)
    const result: Array<{ month: string; occupancyRate: number }> = [];
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.toISOString().substring(0, 7);
      result.push({
        month,
        occupancyRate: parseFloat(occupancyRate),
      });
    }

    return result;
  }
}
