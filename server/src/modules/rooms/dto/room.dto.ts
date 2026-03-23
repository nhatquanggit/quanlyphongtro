import { IsString, IsNumber, IsEnum, IsOptional, IsObject, IsArray, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  RoomType,
  RoomStatus,
  type RoomType as RoomTypeValue,
  type RoomStatus as RoomStatusValue,
} from '@/common/constants/app-enums';

export class CreateRoomDto {
  @ApiProperty()
  @IsString()
  propertyId: string;

  @ApiProperty()
  @IsString()
  roomNumber: string;

  @ApiProperty()
  @IsNumber()
  @Min(1)
  floor: number;

  @ApiProperty({ enum: RoomType })
  @IsEnum(RoomType)
  type: RoomTypeValue;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  deposit: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  area?: number;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  amenities?: any;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  images?: string[];
}

export class UpdateRoomDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  roomNumber?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(1)
  floor?: number;

  @ApiPropertyOptional({ enum: RoomType })
  @IsEnum(RoomType)
  @IsOptional()
  type?: RoomTypeValue;

  @ApiPropertyOptional({ enum: RoomStatus })
  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatusValue;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  deposit?: number;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  @Min(0)
  area?: number;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  amenities?: any;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  images?: string[];
}

export class RoomQueryDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  propertyId?: string;

  @ApiPropertyOptional({ enum: RoomStatus })
  @IsEnum(RoomStatus)
  @IsOptional()
  status?: RoomStatusValue;

  @ApiPropertyOptional({ enum: RoomType })
  @IsEnum(RoomType)
  @IsOptional()
  type?: RoomTypeValue;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  floor?: number;

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
