import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeachersQueryDto } from './dto/teachers-query.dto';
import { Teacher } from './entities/teacher.entity';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';
import { ClassRoom } from '../class-rooms/entities/class-room.entity';

@Injectable()
export class TeachersService {
  constructor(
    @InjectRepository(Teacher)
    private teacherRepository: Repository<Teacher>,
    @InjectRepository(ClassRoom)
    private classRoomRepository: Repository<ClassRoom>,
  ) {}

  async create(createTeacherDto: CreateTeacherDto, companyId: number): Promise<Teacher> {
    try {
      // Verify class room exists and belongs to the same company if provided
      if (createTeacherDto.class_room_id) {
        const classRoom = await this.classRoomRepository.findOne({
          where: { id: createTeacherDto.class_room_id, company_id: companyId, status: Not(-2) },
        });
        if (!classRoom) {
          throw new NotFoundException(`Class room with ID ${createTeacherDto.class_room_id} not found or does not belong to your company`);
        }
      }

      // Always set company_id from authenticated user
      const dtoWithCompany = {
        ...createTeacherDto,
        company_id: companyId,
      };
      const created = this.teacherRepository.create(dtoWithCompany);
      const saved = await this.teacherRepository.save(created);
      return this.findOne(saved.id, companyId);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to create teacher');
    }
  }

  async findAll(query: TeachersQueryDto, companyId: number): Promise<PaginatedResponseDto<Teacher>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const qb = this.teacherRepository.createQueryBuilder('t')
      .leftJoinAndSelect('t.classRoom', 'classRoom')
      .leftJoinAndSelect('t.company', 'company');

    qb.andWhere('t.status <> :deletedStatus', { deletedStatus: -2 });
    // Always filter by company_id from authenticated user
    qb.andWhere('t.company_id = :company_id', { company_id: companyId });

    if (query.search) {
      qb.andWhere(
        '(t.first_name LIKE :search OR t.last_name LIKE :search OR t.email LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.class_room_id) qb.andWhere('t.class_room_id = :class_room_id', { class_room_id: query.class_room_id });
    if (query.status !== undefined) qb.andWhere('t.status = :status', { status: query.status });

    qb.skip((page - 1) * limit).take(limit).orderBy('t.id', 'DESC');

    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number, companyId: number): Promise<Teacher> {
    const found = await this.teacherRepository.findOne({
      where: { id, company_id: companyId, status: Not(-2) },
      relations: ['classRoom', 'company'],
    });
    if (!found) throw new NotFoundException('Teacher not found');
    return found;
  }

  async update(id: number, updateTeacherDto: UpdateTeacherDto, companyId: number): Promise<Teacher> {
    const existing = await this.findOne(id, companyId);

    // If class_room_id is being updated, verify it belongs to the same company
    if (updateTeacherDto.class_room_id !== undefined) {
      if (updateTeacherDto.class_room_id) {
        const classRoom = await this.classRoomRepository.findOne({
          where: { id: updateTeacherDto.class_room_id, company_id: companyId, status: Not(-2) },
        });
        if (!classRoom) {
          throw new NotFoundException(`Class room with ID ${updateTeacherDto.class_room_id} not found or does not belong to your company`);
        }
      }
    }

    // Prevent changing company_id - always use authenticated user's company
    const dtoWithoutCompany = { ...updateTeacherDto };
    delete (dtoWithoutCompany as any).company_id;

    const merged = this.teacherRepository.merge(existing, dtoWithoutCompany);
    const relationMappings = {
      class_room_id: 'classRoom',
    } as const;

    (Object.entries(relationMappings) as Array<[keyof UpdateTeacherDto, keyof Teacher]>).forEach(([idProp, relationProp]) => {
      const value = (updateTeacherDto as any)[idProp];
      if (value !== undefined) {
        (merged as any)[idProp] = value;
        // Handle optional relations (class_room_id) - allow null
        if (idProp === 'class_room_id') {
          (merged as any)[relationProp] = value ? ({ id: value } as any) : null;
        } else {
          (merged as any)[relationProp] = value ? ({ id: value } as any) : undefined;
        }
      }
    });

    // Ensure company_id remains from authenticated user
    merged.company_id = companyId;
    merged.company = { id: companyId } as any;

    await this.teacherRepository.save(merged);
    return this.findOne(id, companyId);
  }

  async remove(id: number, companyId: number): Promise<void> {
    const existing = await this.findOne(id, companyId);
    await this.teacherRepository.remove(existing);
  }
}
