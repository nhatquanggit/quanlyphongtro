import { IsString, IsOptional, IsNumber, Min, Max, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ContractStatus,
  type ContractStatus as ContractStatusValue,
} from '@/common/constants/app-enums';

export class CreateContractDto {
  @ApiProperty()
  @IsString()
  roomId: string;

  @ApiProperty()
  @IsString()
  tenantId: string;

  @ApiProperty()
  @IsString()
  propertyId: string;

  @ApiProperty({ example: '2026-03-01' })
  @IsDateString()
  startDate: string;

  @ApiProperty({ minimum: 3, maximum: 12, example: 6 })
  @IsNumber()
  @Min(3)
  @Max(12)
  termMonths: number;

  @ApiPropertyOptional({ example: 4500000 })
  @IsNumber()
  @IsOptional()
  monthlyRent?: number;

  @ApiPropertyOptional({ example: 4500000 })
  @IsNumber()
  @IsOptional()
  deposit?: number;

  @ApiPropertyOptional({ example: 3500 })
  @IsNumber()
  @IsOptional()
  electricityPrice?: number;

  @ApiPropertyOptional({ example: 18000 })
  @IsNumber()
  @IsOptional()
  waterPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  services?: Record<string, unknown>;

  @ApiPropertyOptional({ example: '2026-03-01' })
  @IsDateString()
  @IsOptional()
  signedDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateContractDto {
  @ApiPropertyOptional({ enum: ContractStatus })
  @IsEnum(ContractStatus)
  @IsOptional()
  status?: ContractStatusValue;

  @ApiPropertyOptional({ example: 4500000 })
  @IsNumber()
  @IsOptional()
  monthlyRent?: number;

  @ApiPropertyOptional({ example: 4500000 })
  @IsNumber()
  @IsOptional()
  deposit?: number;

  @ApiPropertyOptional({ example: 3500 })
  @IsNumber()
  @IsOptional()
  electricityPrice?: number;

  @ApiPropertyOptional({ example: 18000 })
  @IsNumber()
  @IsOptional()
  waterPrice?: number;

  @ApiPropertyOptional()
  @IsOptional()
  services?: Record<string, unknown>;

  @ApiPropertyOptional({ example: '2026-03-01' })
  @IsDateString()
  @IsOptional()
  signedDate?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ContractQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  propertyId?: string;

  @ApiPropertyOptional({ enum: ContractStatus })
  @IsEnum(ContractStatus)
  @IsOptional()
  status?: ContractStatusValue;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  tenantId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  roomId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({ default: 20 })
  @IsNumber()
  @IsOptional()
  limit?: number;
}
