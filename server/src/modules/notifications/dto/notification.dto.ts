import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export const TenantEventType = {
  CHAT_MESSAGE: 'CHAT_MESSAGE',
  RENTAL_REQUEST: 'RENTAL_REQUEST',
  GENERAL: 'GENERAL',
} as const;

export type TenantEventType = (typeof TenantEventType)[keyof typeof TenantEventType];

export class TenantEventDto {
  @ApiPropertyOptional({ enum: TenantEventType, default: TenantEventType.GENERAL })
  @IsEnum(TenantEventType)
  eventType: TenantEventType = TenantEventType.GENERAL;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(120)
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  message?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(120)
  roomNumber?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(120)
  link?: string;
}
