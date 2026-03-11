import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MaintenanceService } from './maintenance.service';
import {
  CreateMaintenanceDto,
  UpdateMaintenanceDto,
  AssignMaintenanceDto,
  CompleteMaintenanceDto,
  MaintenanceQueryDto,
} from './dto/maintenance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Maintenance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('maintenance')
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new maintenance request' })
  create(@Body() createMaintenanceDto: CreateMaintenanceDto) {
    return this.maintenanceService.create(createMaintenanceDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all maintenance requests with filters' })
  findAll(@Query() query: MaintenanceQueryDto) {
    return this.maintenanceService.findAll(query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get maintenance statistics' })
  getStats(@Query('propertyId') propertyId?: string) {
    return this.maintenanceService.getStats(propertyId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get maintenance request by ID' })
  findOne(@Param('id') id: string) {
    return this.maintenanceService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update maintenance request' })
  update(@Param('id') id: string, @Body() updateMaintenanceDto: UpdateMaintenanceDto) {
    return this.maintenanceService.update(id, updateMaintenanceDto);
  }

  @Patch(':id/assign')
  @ApiOperation({ summary: 'Assign maintenance request to a worker' })
  assign(@Param('id') id: string, @Body() assignDto: AssignMaintenanceDto) {
    return this.maintenanceService.assign(id, assignDto);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Mark maintenance request as completed' })
  complete(@Param('id') id: string, @Body() completeDto: CompleteMaintenanceDto) {
    return this.maintenanceService.complete(id, completeDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete maintenance request' })
  remove(@Param('id') id: string) {
    return this.maintenanceService.remove(id);
  }
}
