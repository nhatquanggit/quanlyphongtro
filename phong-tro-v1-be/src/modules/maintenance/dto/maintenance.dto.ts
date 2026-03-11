import { IsString, IsEnum, IsOptional, IsNumber, IsDateString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MaintenanceType, MaintenanceUrgency, MaintenanceStatus } from '@prisma/client';

export class CreateMaintenanceDto {
  @ApiProperty()
  @IsString()
  roomId: string;

  @ApiProperty()
  @IsString()
  propertyId: string;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiProperty({ enum: MaintenanceType })
  @IsEnum(MaintenanceType)
  type: MaintenanceType;

  @ApiProperty({ enum: MaintenanceUrgency })
  @IsEnum(MaintenanceUrgency)
  urgency: MaintenanceUrgency;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reportedById?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  images?: string[];
}

export class UpdateMaintenanceDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ enum: MaintenanceType })
  @IsEnum(MaintenanceType)
  @IsOptional()
  type?: MaintenanceType;

  @ApiPropertyOptional({ enum: MaintenanceUrgency })
  @IsEnum(MaintenanceUrgency)
  @IsOptional()
  urgency?: MaintenanceUrgency;

  @ApiPropertyOptional({ enum: MaintenanceStatus })
  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatus;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  cost?: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class AssignMaintenanceDto {
  @ApiProperty()
  @IsString()
  assignedToId: string;

  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  scheduledDate?: string;
}

export class CompleteMaintenanceDto {
  @ApiProperty()
  @IsNumber()
  cost: number;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class MaintenanceQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  propertyId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  roomId?: string;

  @ApiPropertyOptional({ enum: MaintenanceStatus })
  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatus;

  @ApiPropertyOptional({ enum: MaintenanceUrgency })
  @IsEnum(MaintenanceUrgency)
  @IsOptional()
  urgency?: MaintenanceUrgency;

  @ApiPropertyOptional({ enum: MaintenanceType })
  @IsEnum(MaintenanceType)
  @IsOptional()
  type?: MaintenanceType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsNumber()
  @IsOptional()
  limit?: number;
}
