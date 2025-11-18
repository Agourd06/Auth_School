import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { CreateStudentsPlanningDto } from './dto/create-students-planning.dto';
import { UpdateStudentsPlanningDto } from './dto/update-students-planning.dto';
import { StudentsPlanning } from './entities/students-planning.entity';
import { StudentsPlanningQueryDto } from './dto/students-planning-query.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';
import { Teacher } from '../teachers/entities/teacher.entity';
import { Specialization } from '../specializations/entities/specialization.entity';
import { ClassEntity } from '../class/entities/class.entity';
import { ClassRoom } from '../class-rooms/entities/class-room.entity';
import { PlanningSessionType } from '../planning-session-types/entities/planning-session-type.entity';
import { SchoolYear } from '../school-years/entities/school-year.entity';
import { Course } from '../course/entities/course.entity';

@Injectable()
export class StudentsPlanningsService {
  constructor(
    @InjectRepository(StudentsPlanning)
    private readonly repo: Repository<StudentsPlanning>,
    @InjectRepository(Teacher)
    private readonly teacherRepo: Repository<Teacher>,
    @InjectRepository(Specialization)
    private readonly specializationRepo: Repository<Specialization>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(ClassEntity)
    private readonly classRepo: Repository<ClassEntity>,
    @InjectRepository(ClassRoom)
    private readonly classRoomRepo: Repository<ClassRoom>,
    @InjectRepository(PlanningSessionType)
    private readonly planningSessionTypeRepo: Repository<PlanningSessionType>,
    @InjectRepository(SchoolYear)
    private readonly schoolYearRepo: Repository<SchoolYear>,
  ) {}

  async create(dto: CreateStudentsPlanningDto, companyId: number): Promise<StudentsPlanning> {
    // Verify teacher exists and belongs to the same company
    const teacher = await this.teacherRepo.findOne({
      where: { id: dto.teacher_id, company_id: companyId, status: Not(-2) },
    });
    if (!teacher) {
      throw new NotFoundException(`Teacher with ID ${dto.teacher_id} not found or does not belong to your company`);
    }

    // Verify specialization exists and belongs to the same company
    const specialization = await this.specializationRepo.findOne({
      where: { id: dto.specialization_id, company_id: companyId, status: Not(-2) },
    });
    if (!specialization) {
      throw new NotFoundException(`Specialization with ID ${dto.specialization_id} not found or does not belong to your company`);
    }

    // Verify course exists and belongs to the same company
    const course = await this.courseRepo.findOne({
      where: { id: dto.course_id, company_id: companyId, status: Not(-2) },
    });
    if (!course) {
      throw new NotFoundException(`Course with ID ${dto.course_id} not found or does not belong to your company`);
    }

    // Verify class exists and belongs to the same company
    const classEntity = await this.classRepo.findOne({
      where: { id: dto.class_id, company_id: companyId, status: Not(-2) },
    });
    if (!classEntity) {
      throw new NotFoundException(`Class with ID ${dto.class_id} not found or does not belong to your company`);
    }

    // Verify class room exists and belongs to the same company
    const classRoom = await this.classRoomRepo.findOne({
      where: { id: dto.class_room_id, company_id: companyId, status: Not(-2) },
    });
    if (!classRoom) {
      throw new NotFoundException(`Class room with ID ${dto.class_room_id} not found or does not belong to your company`);
    }

    // Verify planning session type exists and belongs to the same company
    const planningSessionType = await this.planningSessionTypeRepo.findOne({
      where: { id: dto.planning_session_type_id, company_id: companyId },
    });
    if (!planningSessionType) {
      throw new NotFoundException(`Planning session type with ID ${dto.planning_session_type_id} not found or does not belong to your company`);
    }

    // Verify school year exists and belongs to the same company if provided
    if (dto.school_year_id) {
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

    this.ensureValidTimeRange(dto.hour_start, dto.hour_end);
    await this.ensureNoOverlap(dto, undefined, companyId);

    // Always set company_id from authenticated user
    const entity = this.repo.create({
      ...dto,
      status: dto.status ?? 2,
      company_id: companyId,
    });

    const saved = await this.repo.save(entity);
    return this.findOne(saved.id, companyId);
  }

  async findAll(query: StudentsPlanningQueryDto, companyId: number): Promise<PaginatedResponseDto<StudentsPlanning>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const order = (query.order ?? 'ASC').toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const qb = this.repo
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.teacher', 'teacher')
      .leftJoinAndSelect('plan.specialization', 'specialization')
      .leftJoinAndSelect('plan.course', 'course')
      .leftJoinAndSelect('plan.class', 'class')
      .leftJoinAndSelect('plan.classRoom', 'classRoom')
      .leftJoinAndSelect('plan.company', 'company')
      .leftJoinAndSelect('plan.planningSessionType', 'planningSessionType')
      .leftJoinAndSelect('plan.schoolYear', 'schoolYear');

    // Always filter by company_id from authenticated user
    qb.andWhere('plan.company_id = :company_id', { company_id: companyId });
    // Exclude soft-deleted records (status = -2)
    qb.andWhere('plan.status <> :deletedStatus', { deletedStatus: -2 });

    if (query.status !== undefined) qb.andWhere('plan.status = :status', { status: query.status });
    if (query.class_id) qb.andWhere('plan.class_id = :class_id', { class_id: query.class_id });
    if (query.class_room_id) qb.andWhere('plan.class_room_id = :class_room_id', { class_room_id: query.class_room_id });
    if (query.teacher_id) qb.andWhere('plan.teacher_id = :teacher_id', { teacher_id: query.teacher_id });
    if (query.specialization_id) qb.andWhere('plan.specialization_id = :specialization_id', { specialization_id: query.specialization_id });
    if (query.course_id) qb.andWhere('plan.course_id = :course_id', { course_id: query.course_id });
    if (query.planning_session_type_id) qb.andWhere('plan.planning_session_type_id = :planning_session_type_id', { planning_session_type_id: query.planning_session_type_id });
    if (query.school_year_id) qb.andWhere('plan.school_year_id = :school_year_id', { school_year_id: query.school_year_id });

    qb.orderBy('plan.date_day', order as 'ASC' | 'DESC').addOrderBy('plan.hour_start', order as 'ASC' | 'DESC');
    qb.skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number, companyId: number): Promise<StudentsPlanning> {
    const found = await this.repo.findOne({
      where: { id, company_id: companyId, status: Not(-2) },
      relations: ['teacher', 'specialization', 'course', 'class', 'classRoom', 'company', 'planningSessionType', 'schoolYear'],
    });
    if (!found) throw new NotFoundException('Planning record not found');
    return found;
  }

  async update(id: number, dto: UpdateStudentsPlanningDto, companyId: number): Promise<StudentsPlanning> {
    const existing = await this.findOne(id, companyId);

    // If teacher_id is being updated, verify it belongs to the same company
    if (dto.teacher_id !== undefined) {
      const teacher = await this.teacherRepo.findOne({
        where: { id: dto.teacher_id, company_id: companyId, status: Not(-2) },
      });
      if (!teacher) {
        throw new NotFoundException(`Teacher with ID ${dto.teacher_id} not found or does not belong to your company`);
      }
    }

    // If course_id is being updated, verify it belongs to the same company
    if (dto.course_id !== undefined) {
      const course = await this.courseRepo.findOne({
        where: { id: dto.course_id, company_id: companyId, status: Not(-2) },
      });
      if (!course) {
        throw new NotFoundException(`Course with ID ${dto.course_id} not found or does not belong to your company`);
      }
    }

    // If specialization_id is being updated, verify it belongs to the same company
    if (dto.specialization_id !== undefined) {
      const specialization = await this.specializationRepo.findOne({
        where: { id: dto.specialization_id, company_id: companyId, status: Not(-2) },
      });
      if (!specialization) {
        throw new NotFoundException(`Specialization with ID ${dto.specialization_id} not found or does not belong to your company`);
      }
    }

    // If class_id is being updated, verify it belongs to the same company
    if (dto.class_id !== undefined) {
      const classEntity = await this.classRepo.findOne({
        where: { id: dto.class_id, company_id: companyId, status: Not(-2) },
      });
      if (!classEntity) {
        throw new NotFoundException(`Class with ID ${dto.class_id} not found or does not belong to your company`);
      }
    }

    // If class_room_id is being updated, verify it belongs to the same company
    if (dto.class_room_id !== undefined) {
      const classRoom = await this.classRoomRepo.findOne({
        where: { id: dto.class_room_id, company_id: companyId, status: Not(-2) },
      });
      if (!classRoom) {
        throw new NotFoundException(`Class room with ID ${dto.class_room_id} not found or does not belong to your company`);
      }
    }

    // If planning_session_type_id is being updated, verify it belongs to the same company
    if (dto.planning_session_type_id !== undefined) {
      const planningSessionType = await this.planningSessionTypeRepo.findOne({
        where: { id: dto.planning_session_type_id, company_id: companyId },
      });
      if (!planningSessionType) {
        throw new NotFoundException(`Planning session type with ID ${dto.planning_session_type_id} not found or does not belong to your company`);
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

    const mergedPayload = {
      ...existing,
      ...dto,
    } as CreateStudentsPlanningDto & { status?: number };

    this.ensureValidTimeRange(mergedPayload.hour_start, mergedPayload.hour_end);
    await this.ensureNoOverlap(mergedPayload, id, companyId);

    // Prevent changing company_id - always use authenticated user's company
    const dtoWithoutCompany = { ...dto };
    delete (dtoWithoutCompany as any).company_id;

    const merged = this.repo.merge(existing, dtoWithoutCompany);
    // Ensure company_id remains from authenticated user
    merged.company_id = companyId;
    merged.company = { id: companyId } as any;
    await this.repo.save(merged);
    return this.findOne(id, companyId);
  }

  async remove(id: number, companyId: number): Promise<void> {
    const existing = await this.findOne(id, companyId);
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
      status?: number;
      company_id?: number;
    },
    excludeId?: number,
    companyId?: number,
  ): Promise<void> {
    const qb = this.repo
      .createQueryBuilder('plan')
      .where('plan.date_day = :date_day', { date_day: dto.date_day })
      .andWhere('NOT (plan.hour_end <= :start OR plan.hour_start >= :end)', {
        start: dto.hour_start,
        end: dto.hour_end,
      })
      .andWhere('plan.status <> :deletedStatus', { deletedStatus: -2 });

    // Always filter by company_id to only check overlaps within the same company
    if (companyId) {
      qb.andWhere('plan.company_id = :company_id', { company_id: companyId });
    }

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
