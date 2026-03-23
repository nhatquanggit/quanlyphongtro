import { IsString, IsNumber, IsOptional, IsEnum, IsDateString, IsObject, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { InvoiceStatus, type InvoiceStatus as InvoiceStatusValue } from '@/common/constants/app-enums';

export class CreateInvoiceDto {
  @ApiProperty()
  @IsString()
  contractId: string;

  @ApiProperty()
  @IsString()
  tenantId: string;

  @ApiProperty()
  @IsString()
  roomId: string;

  @ApiProperty()
  @IsString()
  propertyId: string;

  @ApiProperty({ example: '2024-01' })
  @IsString()
  billingMonth: string;

  @ApiProperty()
  @IsDateString()
  dueDate: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  rentAmount: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  electricityUsage?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  electricityCost?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  waterUsage?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  waterCost?: number;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  serviceCharges?: any;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateInvoiceDto {
  @ApiPropertyOptional()
  @IsDateString()
  @IsOptional()
  dueDate?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  rentAmount?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  electricityUsage?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  electricityCost?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  waterUsage?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  waterCost?: number;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  serviceCharges?: any;

  @ApiPropertyOptional()
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatusValue;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class MarkPaidDto {
  @ApiProperty()
  @IsNumber()
  @Min(0)
  paidAmount: number;

  @ApiProperty()
  @IsDateString()
  paymentDate: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  paymentMethod?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  notes?: string;
}

export class GenerateInvoicesDto {
  @ApiProperty()
  @IsString()
  propertyId: string;

  @ApiProperty({ example: '2024-01' })
  @IsString()
  billingMonth: string;

  @ApiProperty()
  @IsDateString()
  dueDate: string;
}

export class InvoiceQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  propertyId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  tenantId?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  roomId?: string;

  @ApiPropertyOptional()
  @IsEnum(InvoiceStatus)
  @IsOptional()
  status?: InvoiceStatusValue;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  billingMonth?: string;

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
