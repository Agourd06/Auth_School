import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { UsersService } from '../users/users.service';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    try {
      const user = await this.usersService.findByEmail(loginDto.email);
      
      const passwordMatch = await bcrypt.compare(loginDto.password, user.password);
      if (!passwordMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }

      const payload = {
        userId: user.id,
      };

      return {
        token: this.jwtService.sign(payload, { expiresIn: '1h' }),
        email: user.email,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw error;
    }
  }

  async register(registerDto: RegisterDto) {
    return await this.usersService.create(registerDto);
  }

  async sendPasswordResetEmail(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const user = await this.usersService.findByEmail(forgotPasswordDto.email);

      const payload = {
        userId: user.id,
      };

      const resetToken = this.jwtService.sign(payload, { expiresIn: '15m' });

      // Email configuration
      const transporter = nodemailer.createTransporter({
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL,
          pass: process.env.EMAIL_PASSWORD,
        },
      });

      const resetURL = `http://localhost:5173/auth/reset?token=${resetToken}`;
      const mailOptions = {
        to: user.email,
        from: process.env.EMAIL,
        subject: 'Password Reset',
        // html
      };

      await transporter.sendMail(mailOptions);
      return { message: 'Password reset email sent' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto) {
    try {
      // Validate password confirmation
      if (resetPasswordDto.password !== resetPasswordDto.confirmPassword) {
        throw new UnauthorizedException('Passwords do not match');
      }

      const decoded = this.jwtService.verify(token);
      const user = await this.usersService.findOne(decoded.userId);
      
      await this.usersService.update(user.id, { password: resetPasswordDto.password });
      
      return { message: 'Password has been reset' };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      throw new UnauthorizedException('Invalid token');
    }
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto) {
    // Validate password confirmation
    if (changePasswordDto.newPassword !== changePasswordDto.confirmPassword) {
      throw new UnauthorizedException('New passwords do not match');
    }

    const user = await this.usersService.findOne(userId);

    // Verify current password
    const currentPasswordMatch = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    if (!currentPasswordMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Update password
    await this.usersService.update(user.id, { password: changePasswordDto.newPassword });
    
    return { message: 'Password has been changed successfully' };
  }
}