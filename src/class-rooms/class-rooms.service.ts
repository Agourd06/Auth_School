import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
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

  async create(createClassRoomDto: CreateClassRoomDto, companyId: number): Promise<ClassRoom> {
    try {
      // Always set company_id from authenticated user
      const dtoWithCompany = {
        ...createClassRoomDto,
        company_id: companyId,
      };
      const created = this.classRoomRepository.create(dtoWithCompany);
      return await this.classRoomRepository.save(created);
    } catch (error) {
      throw new BadRequestException('Failed to create classroom');
    }
  }

  async findAll(query: ClassRoomQueryDto, companyId: number): Promise<PaginatedResponseDto<ClassRoom>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const qb = this.classRoomRepository.createQueryBuilder('cr');

    qb.andWhere('cr.status <> :deletedStatus', { deletedStatus: -2 });
    // Always filter by company_id from authenticated user
    qb.andWhere('cr.company_id = :company_id', { company_id: companyId });

    if (query.search) {
      qb.andWhere('(cr.code LIKE :search OR cr.title LIKE :search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.status !== undefined) {
      qb.andWhere('cr.status = :status', { status: query.status });
    }

    qb.skip((page - 1) * limit).take(limit).orderBy('cr.id', 'DESC');

    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number, companyId: number): Promise<ClassRoom> {
    const found = await this.classRoomRepository.findOne({ 
      where: { id, company_id: companyId, status: Not(-2) } 
    });
    if (!found) throw new NotFoundException('Classroom not found');
    return found;
  }

  async update(id: number, updateClassRoomDto: UpdateClassRoomDto, companyId: number): Promise<ClassRoom> {
    const existing = await this.findOne(id, companyId);
    
    // Prevent changing company_id - always use authenticated user's company
    const dtoWithoutCompany = { ...updateClassRoomDto };
    delete (dtoWithoutCompany as any).company_id;
    
    const merged = this.classRoomRepository.merge(existing, dtoWithoutCompany);
    // Ensure company_id remains from authenticated user
    merged.company_id = companyId;
    merged.company = { id: companyId } as any;
    
    return this.classRoomRepository.save(merged);
  }

  async remove(id: number, companyId: number): Promise<void> {
    const existing = await this.findOne(id, companyId);
    await this.classRoomRepository.remove(existing);
  }
}
