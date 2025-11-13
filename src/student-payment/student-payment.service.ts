import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateStudentPaymentDto } from './dto/create-student-payment.dto';
import { UpdateStudentPaymentDto } from './dto/update-student-payment.dto';
import { StudentPayment } from './entities/student-payment.entity';
import { StudentPaymentQueryDto } from './dto/student-payment-query.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class StudentPaymentService {
  constructor(
    @InjectRepository(StudentPayment)
    private readonly repo: Repository<StudentPayment>,
  ) {}

  async create(dto: CreateStudentPaymentDto): Promise<StudentPayment> {
    this.validatePaymentAmount(dto.payment, dto.amount);

    const entity = this.repo.create({
      ...dto,
      status: dto.status ?? 2,
    });

    const saved = await this.repo.save(entity);
    return this.findOne(saved.id);
  }

  async findAll(query: StudentPaymentQueryDto): Promise<PaginatedResponseDto<StudentPayment>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.repo
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.student', 'student')
      .leftJoinAndSelect('payment.schoolYear', 'schoolYear')
      .leftJoinAndSelect('payment.level', 'level')
      .leftJoinAndSelect('payment.levelPricing', 'levelPricing')
      .leftJoinAndSelect('payment.company', 'company')
      .where('payment.status <> :deletedStatus', { deletedStatus: -2 })
      .orderBy('payment.date', 'DESC')
      .addOrderBy('payment.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status !== undefined) {
      qb.andWhere('payment.status = :status', { status: query.status });
    }

    if (query.student_id) {
      qb.andWhere('payment.student_id = :student_id', { student_id: query.student_id });
    }

    if (query.school_year_id) {
      qb.andWhere('payment.school_year_id = :school_year_id', { school_year_id: query.school_year_id });
    }

    if (query.level_id) {
      qb.andWhere('payment.level_id = :level_id', { level_id: query.level_id });
    }

    if (query.level_pricing_id) {
      qb.andWhere('payment.level_pricing_id = :level_pricing_id', { level_pricing_id: query.level_pricing_id });
    }

    if (query.date) {
      qb.andWhere('payment.date = :date', { date: query.date });
    }

    if (query.mode) {
      qb.andWhere('payment.mode = :mode', { mode: query.mode });
    }

    if (query.search) {
      const search = `%${query.search}%`;
      qb.andWhere(
        '(payment.reference LIKE :search OR payment.mode LIKE :search OR student.first_name LIKE :search OR student.last_name LIKE :search)',
        { search },
      );
    }

    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number): Promise<StudentPayment> {
    const payment = await this.repo.findOne({
      where: { id, status: Not(-2) },
      relations: ['student', 'schoolYear', 'level', 'levelPricing', 'company'],
    });
    if (!payment) {
      throw new NotFoundException('Student payment not found');
    }
    return payment;
  }

  async update(id: number, dto: UpdateStudentPaymentDto): Promise<StudentPayment> {
    const existing = await this.findOne(id);
    const merged = this.repo.merge(existing, dto);
    
    // Validate payment doesn't exceed amount
    const paymentAmount = dto.payment !== undefined ? dto.payment : existing.payment;
    const totalAmount = dto.amount !== undefined ? dto.amount : existing.amount;
    this.validatePaymentAmount(paymentAmount, totalAmount);
    
    await this.repo.save(merged);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    existing.status = -2;
    await this.repo.save(existing);
  }

  private validatePaymentAmount(payment: number, amount: number): void {
    if (payment > amount) {
      throw new BadRequestException('Payment amount cannot exceed the total amount to be paid');
    }
  }
}

