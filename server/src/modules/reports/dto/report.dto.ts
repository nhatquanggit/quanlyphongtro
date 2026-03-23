import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportType, type ReportType as ReportTypeValue } from '@/common/constants/app-enums';

export class GenerateReportDto {
  @ApiProperty()
  @IsString()
  propertyId: string;

  @ApiProperty({ enum: ReportType })
  @IsEnum(ReportType)
  reportType: ReportTypeValue;

  @ApiProperty({ example: '2024-01' })
  @IsString()
  period: string;
}

export class ReportQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  propertyId?: string;

  @ApiPropertyOptional({ enum: ReportType })
  @IsEnum(ReportType)
  @IsOptional()
  reportType?: ReportTypeValue;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  period?: string;
}
