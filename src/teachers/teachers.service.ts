import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeachersQueryDto } from './dto/teachers-query.dto';
import { Teacher } from './entities/teacher.entity';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
  ) {}

  async create(createTeacherDto: CreateTeacherDto): Promise<Teacher> {
    try {
      const created = this.teacherRepository.create(createTeacherDto);
      const saved = await this.teacherRepository.save(created);
      return this.findOne(saved.id);
    } catch (error) {
      throw new BadRequestException('Failed to create teacher');
    }
  }

  async findAll(query: TeachersQueryDto): Promise<PaginatedResponseDto<Teacher>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const qb = this.teacherRepository.createQueryBuilder('t')
      .leftJoinAndSelect('t.classRoom', 'classRoom')
      .leftJoinAndSelect('t.company', 'company');

    if (query.search) {
      qb.andWhere(
        '(t.first_name LIKE :search OR t.last_name LIKE :search OR t.email LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.company_id) qb.andWhere('t.company_id = :company_id', { company_id: query.company_id });
    if (query.class_room_id) qb.andWhere('t.class_room_id = :class_room_id', { class_room_id: query.class_room_id });
    if (query.status !== undefined) qb.andWhere('t.status = :status', { status: query.status });

    qb.skip((page - 1) * limit).take(limit).orderBy('t.id', 'DESC');

    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number): Promise<Teacher> {
    const found = await this.teacherRepository.findOne({
      where: { id },
      relations: ['classRoom', 'company'],
    });
    if (!found) throw new NotFoundException('Teacher not found');
    return found;
  }

  async update(id: number, updateTeacherDto: UpdateTeacherDto): Promise<Teacher> {
    const existing = await this.findOne(id);
    const merged = this.teacherRepository.merge(existing, updateTeacherDto);
    await this.teacherRepository.save(merged);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.teacherRepository.remove(existing);
  }
}


