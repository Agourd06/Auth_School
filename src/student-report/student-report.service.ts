import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateStudentReportDto } from './dto/create-student-report.dto';
import { UpdateStudentReportDto } from './dto/update-student-report.dto';
import { StudentReport } from './entities/student-report.entity';
import { StudentReportQueryDto } from './dto/student-report-query.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';
import { Student } from '../students/entities/student.entity';
import { SchoolYearPeriod } from '../school-year-periods/entities/school-year-period.entity';
import { SchoolYear } from '../school-years/entities/school-year.entity';

@Injectable()
export class StudentReportService {
  constructor(
    @InjectRepository(StudentReport)
    private readonly repo: Repository<StudentReport>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(SchoolYearPeriod)
    private readonly periodRepo: Repository<SchoolYearPeriod>,
    @InjectRepository(SchoolYear)
    private readonly schoolYearRepo: Repository<SchoolYear>,
  ) {}

  async create(dto: CreateStudentReportDto, companyId: number): Promise<StudentReport> {
    // Verify student exists and belongs to the same company
    const student = await this.studentRepo.findOne({
      where: { id: dto.student_id, company_id: companyId, status: Not(-2) },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${dto.student_id} not found or does not belong to your company`);
    }

    // Verify school year exists and belongs to the same company
    const schoolYear = await this.schoolYearRepo.findOne({
      where: { id: dto.school_year_id, status: Not(-2) },
      relations: ['company'],
    });
    if (!schoolYear) {
      throw new NotFoundException(`School year with ID ${dto.school_year_id} not found`);
    }
    if (schoolYear.company?.id !== companyId) {
      throw new BadRequestException('School year does not belong to your company');
    }

    // Verify school year period exists, belongs to the same company, and matches the provided year
    const period = await this.periodRepo.findOne({
      where: { id: dto.school_year_period_id, company_id: companyId, status: Not(-2) },
    });
    if (!period) {
      throw new NotFoundException(`School year period with ID ${dto.school_year_period_id} not found or does not belong to your company`);
    }
    if (period.school_year_id !== dto.school_year_id) {
      throw new BadRequestException('School year period does not belong to the provided school year');
    }

    const entity = this.repo.create({
      ...dto,
      passed: dto.passed ?? false,
      status: dto.status ?? 2,
    });

    const saved = await this.repo.save(entity);
    return this.findOne(saved.id, companyId);
  }

  async findAll(query: StudentReportQueryDto, companyId: number): Promise<PaginatedResponseDto<StudentReport>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.repo
      .createQueryBuilder('report')
      .leftJoinAndSelect('report.student', 'student')
      .leftJoinAndSelect('report.period', 'period')
      .leftJoinAndSelect('report.year', 'year')
      .orderBy('report.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    qb.andWhere('report.status <> :deletedStatus', { deletedStatus: -2 });
    // Always filter by company_id through student relationship
    qb.andWhere('student.company_id = :company_id', { company_id: companyId });

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

    if (query.school_year_id) {
      qb.andWhere('report.school_year_id = :school_year_id', { school_year_id: query.school_year_id });
    }

    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number, companyId: number): Promise<StudentReport> {
    const found = await this.repo.findOne({
      where: { id, status: Not(-2) },
      relations: ['student', 'period', 'year'],
    });
    if (!found) {
      throw new NotFoundException('Student report not found');
    }
    // Verify student belongs to the authenticated user's company
    if (found.student?.company_id !== companyId) {
      throw new NotFoundException('Student report not found');
    }
    return found;
  }

  async update(id: number, dto: UpdateStudentReportDto, companyId: number): Promise<StudentReport> {
    const existing = await this.findOne(id, companyId);

    // If student_id is being updated, verify it belongs to the same company
    if (dto.student_id !== undefined) {
      const student = await this.studentRepo.findOne({
        where: { id: dto.student_id, company_id: companyId, status: Not(-2) },
      });
      if (!student) {
        throw new NotFoundException(`Student with ID ${dto.student_id} not found or does not belong to your company`);
      }
    }

    // If school_year_id is being updated, verify it belongs to the same company
    if (dto.school_year_id !== undefined) {
      const schoolYear = await this.schoolYearRepo.findOne({
        where: { id: dto.school_year_id, status: Not(-2) },
        relations: ['company'],
      });
      if (!schoolYear) {
        throw new NotFoundException(`School year with ID ${dto.school_year_id} not found`);
      }
      if (schoolYear.company?.id !== companyId) {
        throw new BadRequestException('School year does not belong to your company');
      }
    }

    // If school_year_period_id is being updated, verify it belongs to the same company
    if (dto.school_year_period_id !== undefined) {
      const period = await this.periodRepo.findOne({
        where: { id: dto.school_year_period_id, company_id: companyId, status: Not(-2) },
      });
      if (!period) {
        throw new NotFoundException(`School year period with ID ${dto.school_year_period_id} not found or does not belong to your company`);
      }
      const targetYearId = dto.school_year_id ?? existing.school_year_id;
      if (targetYearId && period.school_year_id !== targetYearId) {
        throw new BadRequestException('School year period does not belong to the provided school year');
      }
    }

    if (dto.school_year_id !== undefined && dto.school_year_period_id === undefined) {
      // Ensure current period still matches the new year
      const period = await this.periodRepo.findOne({
        where: { id: existing.school_year_period_id, company_id: companyId, status: Not(-2) },
      });
      if (period && period.school_year_id !== dto.school_year_id) {
        throw new BadRequestException('Existing school year period does not belong to the new school year');
      }
    }

    const merged = this.repo.merge(existing, dto);
    await this.repo.save(merged);
    return this.findOne(id, companyId);
  }

  async remove(id: number, companyId: number): Promise<void> {
    const existing = await this.findOne(id, companyId);
    existing.status = -2;
    await this.repo.save(existing);
  }
}
