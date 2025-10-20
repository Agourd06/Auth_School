import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as nodemailer from 'nodemailer';
import { User } from './entities/user.entity';
import { LoginDto, RegisterDto, ForgotPasswordDto, ResetPasswordDto, ChangePasswordDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({ 
      where: { email: loginDto.email } 
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

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
  }

  async register(registerDto: RegisterDto) {
    const user = this.userRepository.create(registerDto);
    return await this.userRepository.save(user);
  }

  async sendPasswordResetEmail(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({ 
      where: { email: forgotPasswordDto.email } 
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

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
  }

  async resetPassword(token: string, resetPasswordDto: ResetPasswordDto) {
    try {
      // Validate password confirmation
      if (resetPasswordDto.password !== resetPasswordDto.confirmPassword) {
        throw new UnauthorizedException('Passwords do not match');
      }

      const decoded = this.jwtService.verify(token);
      const user = await this.userRepository.findOne({ 
        where: { id: decoded.userId } 
      });
      
      if (!user) {
        throw new NotFoundException('User not found');
      }

      user.password = resetPasswordDto.password;
      await this.userRepository.save(user);
      
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

    const user = await this.userRepository.findOne({ 
      where: { id: userId } 
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify current password
    const currentPasswordMatch = await bcrypt.compare(changePasswordDto.currentPassword, user.password);
    if (!currentPasswordMatch) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Update password
    user.password = changePasswordDto.newPassword;
    await this.userRepository.save(user);
    
    return { message: 'Password has been changed successfully' };
  }
}