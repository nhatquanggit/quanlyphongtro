import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('kpis')
  @ApiOperation({ summary: 'Get all KPIs for dashboard' })
  @ApiQuery({ name: 'propertyId', required: false })
  getKPIs(@Query('propertyId') propertyId?: string) {
    return this.dashboardService.getKPIs(propertyId);
  }

  @Get('activities')
  @ApiOperation({ summary: 'Get recent activities' })
  @ApiQuery({ name: 'propertyId', required: false })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getRecentActivities(@Query('propertyId') propertyId?: string, @Query('limit') limit?: number) {
    return this.dashboardService.getRecentActivities(propertyId, limit ? parseInt(limit.toString()) : 10);
  }

  @Get('alerts')
  @ApiOperation({ summary: 'Get important alerts' })
  @ApiQuery({ name: 'propertyId', required: false })
  getAlerts(@Query('propertyId') propertyId?: string) {
    return this.dashboardService.getAlerts(propertyId);
  }

  @Get('revenue-chart')
  @ApiOperation({ summary: 'Get revenue chart data' })
  @ApiQuery({ name: 'propertyId', required: false })
  @ApiQuery({ name: 'months', required: false, type: Number })
  getRevenueChart(@Query('propertyId') propertyId?: string, @Query('months') months?: number) {
    return this.dashboardService.getRevenueChart(propertyId, months ? parseInt(months.toString()) : 6);
  }

  @Get('occupancy-trend')
  @ApiOperation({ summary: 'Get occupancy trend data' })
  @ApiQuery({ name: 'propertyId', required: false })
  @ApiQuery({ name: 'months', required: false, type: Number })
  getOccupancyTrend(@Query('propertyId') propertyId?: string, @Query('months') months?: number) {
    return this.dashboardService.getOccupancyTrend(propertyId, months ? parseInt(months.toString()) : 6);
  }
}
