import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto, ResetPasswordWithTokenDto, ChangePasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
  ) { }

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
        user: {
          email: user.email,
          username: user.username,
          role: user.role,
        }
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

  async forgotPassword(email: string) {
    try {
      const user = await this.usersService.findByEmail(email);

      const payload = {
        userId: user.id,
        email: user.email,
      };

      const resetToken = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('RESET_TOKEN_SECRET'),
        expiresIn: '15m'
      });

      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

      const html = `
        <h2>Password Reset Request</h2>
        <p>Hello ${user.username},</p>
        <p>You have requested to reset your password. Click the link below to reset it:</p>
        <a href="${resetLink}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `;

      await this.mailService.sendMail(user.email, 'Password Reset Request', html);

      return { message: 'Reset link sent to your email' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('User not found');
      }
      throw error;
    }
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const decoded = this.jwtService.verify(token, {
        secret: this.configService.get<string>('RESET_TOKEN_SECRET')
      });

      const user = await this.usersService.findOne(decoded.userId);

      // Hash the new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // Update the user's password
      await this.usersService.update(user.id, { password: hashedPassword });

      return { message: 'Password successfully updated' };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Token has expired');
      }
      if (error.name === 'JsonWebTokenError') {
        throw new UnauthorizedException('Invalid token');
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