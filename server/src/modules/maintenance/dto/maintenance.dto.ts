import { IsString, IsEnum, IsOptional, IsNumber, IsDateString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  MaintenanceType,
  MaintenanceUrgency,
  MaintenanceStatus,
  type MaintenanceType as MaintenanceTypeValue,
  type MaintenanceUrgency as MaintenanceUrgencyValue,
  type MaintenanceStatus as MaintenanceStatusValue,
} from '@/common/constants/app-enums';

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
  type: MaintenanceTypeValue;

  @ApiProperty({ enum: MaintenanceUrgency })
  @IsEnum(MaintenanceUrgency)
  urgency: MaintenanceUrgencyValue;

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
  type?: MaintenanceTypeValue;

  @ApiPropertyOptional({ enum: MaintenanceUrgency })
  @IsEnum(MaintenanceUrgency)
  @IsOptional()
  urgency?: MaintenanceUrgencyValue;

  @ApiPropertyOptional({ enum: MaintenanceStatus })
  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatusValue;

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
  status?: MaintenanceStatusValue;

  @ApiPropertyOptional({ enum: MaintenanceUrgency })
  @IsEnum(MaintenanceUrgency)
  @IsOptional()
  urgency?: MaintenanceUrgencyValue;

  @ApiPropertyOptional({ enum: MaintenanceType })
  @IsEnum(MaintenanceType)
  @IsOptional()
  type?: MaintenanceTypeValue;

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
