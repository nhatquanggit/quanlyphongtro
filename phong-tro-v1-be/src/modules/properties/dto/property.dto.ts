import { IsString, IsInt, IsOptional, IsEnum } from 'class-validator';

export class CreatePropertyDto {
  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsInt()
  totalFloors: number;

  @IsInt()
  totalRooms: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsOptional()
  settings?: any;
}

export class UpdatePropertyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsInt()
  @IsOptional()
  totalFloors?: number;

  @IsInt()
  @IsOptional()
  totalRooms?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsOptional()
  settings?: any;
}
