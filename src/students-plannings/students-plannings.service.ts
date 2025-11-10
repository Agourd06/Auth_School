import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentsPlanningDto } from './dto/create-students-planning.dto';
import { UpdateStudentsPlanningDto } from './dto/update-students-planning.dto';
import { StudentsPlanning } from './entities/students-planning.entity';
import { StudentsPlanningQueryDto } from './dto/students-planning-query.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class StudentsPlanningsService {
  constructor(
    @InjectRepository(StudentsPlanning)
    private readonly repo: Repository<StudentsPlanning>,
  ) {}

  async create(dto: CreateStudentsPlanningDto): Promise<StudentsPlanning> {
    this.ensureValidTimeRange(dto.hour_start, dto.hour_end);
    await this.ensureNoOverlap(dto);

    const entity = this.repo.create({
      ...dto,
      status: dto.status ?? 'planned',
    });

    const saved = await this.repo.save(entity);
    return this.findOne(saved.id);
  }

  async findAll(query: StudentsPlanningQueryDto): Promise<PaginatedResponseDto<StudentsPlanning>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const order = (query.order ?? 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const qb = this.repo
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.teacher', 'teacher')
      .leftJoinAndSelect('plan.specialization', 'specialization')
      .leftJoinAndSelect('plan.class', 'class')
      .leftJoinAndSelect('plan.classRoom', 'classRoom')
      .leftJoinAndSelect('plan.company', 'company')
      .leftJoinAndSelect('plan.planningSessionType', 'planningSessionType');

    if (query.status) qb.andWhere('plan.status = :status', { status: query.status });
    if (query.class_id) qb.andWhere('plan.class_id = :class_id', { class_id: query.class_id });
    if (query.class_room_id) qb.andWhere('plan.class_room_id = :class_room_id', { class_room_id: query.class_room_id });
    if (query.teacher_id) qb.andWhere('plan.teacher_id = :teacher_id', { teacher_id: query.teacher_id });
    if (query.specialization_id) qb.andWhere('plan.specialization_id = :specialization_id', { specialization_id: query.specialization_id });
    if (query.planning_session_type_id) qb.andWhere('plan.planning_session_type_id = :planning_session_type_id', { planning_session_type_id: query.planning_session_type_id });

    qb.orderBy('plan.date_day', order as 'ASC' | 'DESC').addOrderBy('plan.hour_start', order as 'ASC' | 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number): Promise<StudentsPlanning> {
    const found = await this.repo.findOne({
      where: { id },
      relations: ['teacher', 'specialization', 'class', 'classRoom', 'company', 'planningSessionType'],
    });
    if (!found) throw new NotFoundException('Planning record not found');
    return found;
  }

  async update(id: number, dto: UpdateStudentsPlanningDto): Promise<StudentsPlanning> {
    const existing = await this.findOne(id);

    const mergedPayload = {
      ...existing,
      ...dto,
    } as CreateStudentsPlanningDto & { status?: string };

    this.ensureValidTimeRange(mergedPayload.hour_start, mergedPayload.hour_end);
    await this.ensureNoOverlap(mergedPayload, id);

    const merged = this.repo.merge(existing, dto);
    await this.repo.save(merged);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.repo.remove(existing);
  }

  private ensureValidTimeRange(start: string, end: string): void {
    if (!start || !end) {
      throw new BadRequestException('Start and end time are required');
    }
    if (start >= end) {
      throw new BadRequestException('End time must be after start time');
    }
  }

  private async ensureNoOverlap(
    dto: Pick<CreateStudentsPlanningDto, 'date_day' | 'hour_start' | 'hour_end' | 'class_id' | 'class_room_id' | 'teacher_id' | 'specialization_id'> & {
      status?: string;
      company_id?: number;
    },
    excludeId?: number,
  ): Promise<void> {
    const qb = this.repo
      .createQueryBuilder('plan')
      .where('plan.date_day = :date_day', { date_day: dto.date_day })
      .andWhere('NOT (plan.hour_end <= :start OR plan.hour_start >= :end)', {
        start: dto.hour_start,
        end: dto.hour_end,
      });

    if (excludeId) {
      qb.andWhere('plan.id <> :excludeId', { excludeId });
    }

    const scopeConditions: string[] = [];
    const params: Record<string, any> = {};

    if (dto.class_id) {
      scopeConditions.push('plan.class_id = :class_id');
      params.class_id = dto.class_id;
    }
    if (dto.class_room_id) {
      scopeConditions.push('plan.class_room_id = :class_room_id');
      params.class_room_id = dto.class_room_id;
    }
    if (dto.teacher_id) {
      scopeConditions.push('plan.teacher_id = :teacher_id');
      params.teacher_id = dto.teacher_id;
    }

    if (scopeConditions.length) {
      qb.andWhere(`(${scopeConditions.join(' OR ')})`, params);
    }

    const conflict = await qb.getOne();
    if (conflict) {
      throw new BadRequestException('Planning overlaps with another session for the same class, teacher, or classroom.');
    }
  }
}
