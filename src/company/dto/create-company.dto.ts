import { IsString, IsEmail, IsOptional, IsUrl, IsInt, Min, Max } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsInt()
  @Min(-2)
  @Max(2)
  status?: number; // mapped to column 'statut' if present in entity
}
