import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateClassStudentDto } from './dto/create-class-student.dto';
import { UpdateClassStudentDto } from './dto/update-class-student.dto';
import { ClassStudent } from './entities/class-student.entity';
import { ClassStudentQueryDto } from './dto/class-student-query.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class ClassStudentService {
  constructor(
    @InjectRepository(ClassStudent)
    private readonly repo: Repository<ClassStudent>,
  ) {}

  private async ensureStudentAssignable(studentId: number, excludeId?: number): Promise<void> {
    if (!studentId) return;

    const qb = this.repo
      .createQueryBuilder('cs')
      .where('cs.student_id = :studentId', { studentId })
      .andWhere('cs.status <> :deletedStatus', { deletedStatus: -2 });

    if (excludeId) {
      qb.andWhere('cs.id <> :excludeId', { excludeId });
    }

    const existing = await qb.getOne();
    if (existing) {
      throw new BadRequestException('Student is already assigned to a class');
    }
  }

  async create(dto: CreateClassStudentDto): Promise<ClassStudent> {
    await this.ensureStudentAssignable(dto.student_id);

    const entity = this.repo.create(dto);

    try {
      const saved = await this.repo.save(entity);
      return this.findOne(saved.id);
    } catch (error) {
      throw new BadRequestException('Failed to assign student to class');
    }
  }

  async findAll(query: ClassStudentQueryDto): Promise<PaginatedResponseDto<ClassStudent>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.repo
      .createQueryBuilder('cs')
      .leftJoinAndSelect('cs.student', 'student')
      .leftJoinAndSelect('cs.class', 'class')
      .leftJoinAndSelect('cs.company', 'company');

    qb.andWhere('cs.status <> :deletedStatus', { deletedStatus: -2 });

    if (query.search) {
      qb.andWhere('(cs.title LIKE :search OR cs.description LIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.status !== undefined) qb.andWhere('cs.status = :status', { status: query.status });
    if (query.class_id) qb.andWhere('cs.class_id = :class_id', { class_id: query.class_id });
    if (query.student_id) qb.andWhere('cs.student_id = :student_id', { student_id: query.student_id });
    if (query.company_id) qb.andWhere('cs.company_id = :company_id', { company_id: query.company_id });

    qb.orderBy('cs.tri', 'ASC').addOrderBy('cs.id', 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number): Promise<ClassStudent> {
    const found = await this.repo.findOne({
      where: { id, status: Not(-2) },
      relations: ['student', 'class', 'company'],
    });

    if (!found) {
      throw new NotFoundException('Class student assignment not found');
    }

    return found;
  }

  async update(id: number, dto: UpdateClassStudentDto): Promise<ClassStudent> {
    const existing = await this.findOne(id);

    if (dto.student_id && dto.student_id !== existing.student_id) {
      await this.ensureStudentAssignable(dto.student_id, id);
    }

    const merged = this.repo.merge(existing, dto);
    await this.repo.save(merged);

    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.repo.remove(existing);
  }
}
