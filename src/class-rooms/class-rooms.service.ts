import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateClassRoomDto } from './dto/create-class-room.dto';
import { UpdateClassRoomDto } from './dto/update-class-room.dto';
import { ClassRoom } from './entities/class-room.entity';
import { ClassRoomQueryDto } from './dto/class-room-query.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class ClassRoomsService {
  constructor(
    @InjectRepository(ClassRoom)
    private classRoomRepository: Repository<ClassRoom>,
  ) {}

  async create(createClassRoomDto: CreateClassRoomDto): Promise<ClassRoom> {
    try {
      const created = this.classRoomRepository.create(createClassRoomDto);
      return await this.classRoomRepository.save(created);
    } catch (error) {
      throw new BadRequestException('Failed to create classroom');
    }
  }

  async findAll(query: ClassRoomQueryDto): Promise<PaginatedResponseDto<ClassRoom>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const qb = this.classRoomRepository.createQueryBuilder('cr');

    if (query.search) {
      qb.andWhere('(cr.code LIKE :search OR cr.title LIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.company_id) {
      qb.andWhere('cr.company_id = :company_id', { company_id: query.company_id });
    }

    qb.skip((page - 1) * limit).take(limit).orderBy('cr.id', 'DESC');

    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number): Promise<ClassRoom> {
    const found = await this.classRoomRepository.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Classroom not found');
    return found;
  }

  async update(id: number, updateClassRoomDto: UpdateClassRoomDto): Promise<ClassRoom> {
    const existing = await this.findOne(id);
    const merged = this.classRoomRepository.merge(existing, updateClassRoomDto);
    return this.classRoomRepository.save(merged);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.classRoomRepository.remove(existing);
  }
}
