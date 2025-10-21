import { IsString, IsEmail, IsOptional, IsEnum, IsNumber } from 'class-validator';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  password: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(['user', 'admin'])
  role?: 'user' | 'admin';

  @IsOptional()
  @IsNumber()
  company_id?: number;
}
