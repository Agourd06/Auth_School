import { IsEmail, IsString, MinLength, Matches, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
  
}

export class RegisterDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
  
  @IsString()
  @IsNotEmpty()
  username: string;


  @IsEnum(['user', 'admin'], { message: 'Role must be either "user" or "admin"' })
  @IsOptional()
  role?: 'user' | 'admin';
}

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;
}

export class ResetPasswordDto {
  @IsString({ message: 'Password must be a string' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString({ message: 'Confirm password must be a string' })
  @MinLength(6, { message: 'Confirm password must be at least 6 characters long' })
  confirmPassword: string;
}

export class ChangePasswordDto {
  @IsString({ message: 'Current password must be a string' })
  @MinLength(6, { message: 'Current password must be at least 6 characters long' })
  currentPassword: string;

  @IsString({ message: 'New password must be a string' })
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  newPassword: string;

  @IsString({ message: 'Confirm password must be a string' })
  @MinLength(6, { message: 'Confirm password must be at least 6 characters long' })
  confirmPassword: string;
}