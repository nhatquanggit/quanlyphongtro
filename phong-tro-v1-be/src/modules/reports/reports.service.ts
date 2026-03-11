import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/common/prisma/prisma.service';
import { GenerateReportDto, ReportQueryDto } from './dto/report.dto';
import { InvoiceStatus, ExpenseCategory } from '@prisma/client';

@Injectable()
export class ReportsService {
  constructor(private prisma: PrismaService) {}

  async generateReport(generateDto: GenerateReportDto) {
    const { propertyId, reportType, period } = generateDto;

    // Parse period (YYYY-MM or YYYY-QQ or YYYY)
    const { startDate, endDate } = this.parsePeriod(period, reportType);

    // Calculate revenue
    const revenueData = await this.prisma.invoice.aggregate({
      where: {
        propertyId,
        status: InvoiceStatus.PAID,
        paymentDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        totalAmount: true,
      },
    });

    // Calculate expenses
    const expensesData = await this.prisma.expense.aggregate({
      where: {
        propertyId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Get expense breakdown by category
    const expenseBreakdown = await this.prisma.expense.groupBy({
      by: ['category'],
      where: {
        propertyId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Calculate unpaid dues
    const unpaidDues = await this.prisma.invoice.aggregate({
      where: {
        propertyId,
        status: { not: InvoiceStatus.PAID },
      },
      _sum: {
        remainingAmount: true,
      },
    });

    // Calculate occupancy rate
    const totalRooms = await this.prisma.room.count({ where: { propertyId } });
    const occupiedRooms = await this.prisma.room.count({
      where: { propertyId, status: 'OCCUPIED' },
    });
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;

    const totalRevenue = revenueData._sum.totalAmount || 0;
    const totalExpenses = expensesData._sum.amount || 0;
    const netProfit = totalRevenue - totalExpenses;

    // Create or update report
    const report = await this.prisma.report.upsert({
      where: {
        propertyId_period_reportType: {
          propertyId,
          period,
          reportType,
        },
      },
      create: {
        propertyId,
        reportType,
        period,
        totalRevenue,
        totalExpenses,
        netProfit,
        unpaidDues: unpaidDues._sum.remainingAmount || 0,
        occupancyRate,
        data: {
          expenseBreakdown: expenseBreakdown.map((item) => ({
            category: item.category,
            amount: item._sum.amount || 0,
          })),
          startDate,
          endDate,
        },
      },
      update: {
        totalRevenue,
        totalExpenses,
        netProfit,
        unpaidDues: unpaidDues._sum.remainingAmount || 0,
        occupancyRate,
        data: {
          expenseBreakdown: expenseBreakdown.map((item) => ({
            category: item.category,
            amount: item._sum.amount || 0,
          })),
          startDate,
          endDate,
        },
      },
    });

    return report;
  }

  async findAll(query: ReportQueryDto) {
    const { propertyId, reportType, period } = query;

    const where: any = {};
    if (propertyId) where.propertyId = propertyId;
    if (reportType) where.reportType = reportType;
    if (period) where.period = period;

    const reports = await this.prisma.report.findMany({
      where,
      include: {
        property: { select: { name: true } },
      },
      orderBy: { period: 'desc' },
    });

    return reports;
  }

  async findOne(id: string) {
    const report = await this.prisma.report.findUnique({
      where: { id },
      include: {
        property: true,
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.report.delete({
      where: { id },
    });

    return { message: 'Report deleted successfully' };
  }

  async getFinancialSummary(propertyId: string, startDate: Date, endDate: Date) {
    // Revenue
    const revenue = await this.prisma.invoice.aggregate({
      where: {
        propertyId,
        status: InvoiceStatus.PAID,
        paymentDate: { gte: startDate, lte: endDate },
      },
      _sum: { totalAmount: true },
    });

    // Expenses by category
    const expenses = await this.prisma.expense.groupBy({
      by: ['category'],
      where: {
        propertyId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + (exp._sum.amount || 0), 0);

    return {
      totalRevenue: revenue._sum.totalAmount || 0,
      totalExpenses,
      netProfit: (revenue._sum.totalAmount || 0) - totalExpenses,
      expenseBreakdown: expenses.map((exp) => ({
        category: exp.category,
        amount: exp._sum.amount || 0,
      })),
    };
  }

  private parsePeriod(period: string, reportType: string): { startDate: Date; endDate: Date } {
    const startDate = new Date();
    const endDate = new Date();

    if (reportType === 'MONTHLY') {
      // Format: YYYY-MM
      const [year, month] = period.split('-').map(Number);
      startDate.setFullYear(year, month - 1, 1);
      endDate.setFullYear(year, month, 0);
    } else if (reportType === 'QUARTERLY') {
      // Format: YYYY-Q1, YYYY-Q2, etc.
      const [year, quarter] = period.split('-');
      const q = parseInt(quarter.replace('Q', ''));
      const startMonth = (q - 1) * 3;
      startDate.setFullYear(parseInt(year), startMonth, 1);
      endDate.setFullYear(parseInt(year), startMonth + 3, 0);
    } else if (reportType === 'YEARLY') {
      // Format: YYYY
      const year = parseInt(period);
      startDate.setFullYear(year, 0, 1);
      endDate.setFullYear(year, 11, 31);
    }

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);

    return { startDate, endDate };
  }
}
