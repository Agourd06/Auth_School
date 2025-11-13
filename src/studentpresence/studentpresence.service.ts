import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateStudentPresenceDto } from './dto/create-studentpresence.dto';
import { UpdateStudentPresenceDto } from './dto/update-studentpresence.dto';
import { StudentPresence } from './entities/studentpresence.entity';
import { StudentPresenceQueryDto } from './dto/studentpresence-query.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class StudentPresenceService {
  constructor(
    @InjectRepository(StudentPresence)
    private readonly repo: Repository<StudentPresence>,
  ) {}

  async create(dto: CreateStudentPresenceDto): Promise<StudentPresence> {
    const entity = this.repo.create({
      ...dto,
      presence: dto.presence ?? 'absent',
      note: dto.note ?? -1,
      status: dto.status ?? 2,
    });

    const saved = await this.repo.save(entity);
    return this.findOne(saved.id);
  }

  async findAll(query: StudentPresenceQueryDto): Promise<PaginatedResponseDto<StudentPresence>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.repo
      .createQueryBuilder('presence')
      .leftJoinAndSelect('presence.student', 'student')
      .leftJoinAndSelect('presence.studentPlanning', 'studentPlanning')
      .leftJoinAndSelect('presence.company', 'company')
      .orderBy('presence.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    qb.andWhere('presence.status <> :deletedStatus', { deletedStatus: -2 });

    if (query.status !== undefined) {
      qb.andWhere('presence.status = :status', { status: query.status });
    }

    if (query.student_id) {
      qb.andWhere('presence.student_id = :student_id', { student_id: query.student_id });
    }

    if (query.student_planning_id) {
      qb.andWhere('presence.student_planning_id = :student_planning_id', {
        student_planning_id: query.student_planning_id,
      });
    }

    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number): Promise<StudentPresence> {
    const found = await this.repo.findOne({
      where: { id, status: Not(-2) },
      relations: ['student', 'studentPlanning', 'company'],
    });
    if (!found) {
      throw new NotFoundException('Student presence record not found');
    }
    return found;
  }

  async update(id: number, dto: UpdateStudentPresenceDto): Promise<StudentPresence> {
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
