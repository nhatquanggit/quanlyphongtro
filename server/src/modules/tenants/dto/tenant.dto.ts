import {IsString, IsEmail, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { TenantStatus, type TenantStatus as TenantStatusValue } from '@/common/constants/app-enums';

export class CreateTenantDto {
  @IsString()
  propertyId: string;

  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  idCard?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsOptional()
  emergencyContact?: any;
}

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  fullName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  idCard?: string;

  @IsDateString()
  @IsOptional()
  dateOfBirth?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsOptional()
  emergencyContact?: any;

  @IsEnum(TenantStatus)
  @IsOptional()
  status?: TenantStatusValue;
}
