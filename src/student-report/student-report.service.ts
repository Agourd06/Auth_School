import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateStudentReportDto } from './dto/create-student-report.dto';
import { UpdateStudentReportDto } from './dto/update-student-report.dto';
import { StudentReport } from './entities/student-report.entity';
import { StudentReportQueryDto } from './dto/student-report-query.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class StudentReportService {
  constructor(
    @InjectRepository(StudentReport)
    private readonly repo: Repository<StudentReport>,
  ) {}

  async create(dto: CreateStudentReportDto): Promise<StudentReport> {
    const entity = this.repo.create({
      ...dto,
      passed: dto.passed ?? false,
      status: dto.status ?? 2,
    });

    const saved = await this.repo.save(entity);
    return this.findOne(saved.id);
  }

  async findAll(query: StudentReportQueryDto): Promise<PaginatedResponseDto<StudentReport>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.repo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.student', 'student')
      .leftJoinAndSelect('report.period', 'period')
      .orderBy('report.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    qb.andWhere('report.status <> :deletedStatus', { deletedStatus: -2 });

    if (query.status !== undefined) {
      qb.andWhere('report.status = :status', { status: query.status });
    }

    if (query.student_id) {
      qb.andWhere('report.student_id = :student_id', { student_id: query.student_id });
    }

    if (query.school_year_period_id) {
      qb.andWhere('report.school_year_period_id = :school_year_period_id', {
        school_year_period_id: query.school_year_period_id,
      });
    }

    if (query.passed !== undefined) {
      qb.andWhere('report.passed = :passed', { passed: query.passed });
    }

    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number): Promise<StudentReport> {
    const found = await this.repo.findOne({
      where: { id, status: Not(-2) },
      relations: ['student', 'period'],
    });
    if (!found) {
      throw new NotFoundException('Student report not found');
    }
    return found;
  }

  async update(id: number, dto: UpdateStudentReportDto): Promise<StudentReport> {
    const existing = await this.findOne(id);
    const merged = this.repo.merge(existing, dto);
    await this.repo.save(merged);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    existing.status = -2;
    await this.repo.save(existing);
  }
}
