import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateStudentReportDetailDto } from './dto/create-student-report-detail.dto';
import { UpdateStudentReportDetailDto } from './dto/update-student-report-detail.dto';
import { StudentReportDetail } from './entities/student-report-detail.entity';
import { StudentReportDetailQueryDto } from './dto/student-report-detail-query.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class StudentReportDetailService {
  constructor(
    @InjectRepository(StudentReportDetail)
    private readonly repo: Repository<StudentReportDetail>,
  ) {}

  async create(dto: CreateStudentReportDetailDto): Promise<StudentReportDetail> {
    const entity = this.repo.create({
      ...dto,
      status: dto.status ?? 2,
    });
    const saved = await this.repo.save(entity);
    return this.findOne(saved.id);
  }

  async findAll(query: StudentReportDetailQueryDto): Promise<PaginatedResponseDto<StudentReportDetail>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.repo
      .createQueryBuilder('detail')
      .leftJoinAndSelect('detail.studentReport', 'studentReport')
      .leftJoinAndSelect('detail.teacher', 'teacher')
      .leftJoinAndSelect('detail.course', 'course')
      .orderBy('detail.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    qb.andWhere('detail.status <> :deletedStatus', { deletedStatus: -2 });

    if (query.status !== undefined) {
      qb.andWhere('detail.status = :status', { status: query.status });
    }

    if (query.student_report_id) {
      qb.andWhere('detail.student_report_id = :student_report_id', { student_report_id: query.student_report_id });
    }

    if (query.teacher_id) {
      qb.andWhere('detail.teacher_id = :teacher_id', { teacher_id: query.teacher_id });
    }

    if (query.course_id) {
      qb.andWhere('detail.course_id = :course_id', { course_id: query.course_id });
    }

    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number): Promise<StudentReportDetail> {
    const found = await this.repo.findOne({
      where: { id, status: Not(-2) },
      relations: ['studentReport', 'teacher', 'course'],
    });
    if (!found) {
      throw new NotFoundException('Student report detail not found');
    }
    return found;
  }

  async update(id: number, dto: UpdateStudentReportDetailDto): Promise<StudentReportDetail> {
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
