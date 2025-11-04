import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateStudentLinkTypeDto } from './dto/create-studentlinktype.dto';
import { UpdateStudentLinkTypeDto } from './dto/update-studentlinktype.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentLinkType } from './entities/studentlinktype.entity';
import { StudentLinkTypeQueryDto } from './dto/studentlinktype-query.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class StudentlinktypeService {
  constructor(
    @InjectRepository(StudentLinkType)
    private repo: Repository<StudentLinkType>,
  ) {}

  async create(dto: CreateStudentLinkTypeDto): Promise<StudentLinkType> {
    try {
      const created = this.repo.create(dto);
      const saved = await this.repo.save(created);
      return this.findOne(saved.id);
    } catch (e) {
      throw new BadRequestException('Failed to create student link type');
    }
  }

  async findAll(query: StudentLinkTypeQueryDto): Promise<PaginatedResponseDto<StudentLinkType>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const qb = this.repo.createQueryBuilder('t');
    if (query.search) qb.andWhere('t.title LIKE :search', { search: `%${query.search}%` });
    if (query.status !== undefined) qb.andWhere('t.status = :status', { status: query.status });
    if (query.company_id) qb.andWhere('t.company_id = :company_id', { company_id: query.company_id });
    qb.skip((page - 1) * limit).take(limit).orderBy('t.id', 'DESC');
    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number): Promise<StudentLinkType> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Student link type not found');
    return found;
  }

  async update(id: number, dto: UpdateStudentLinkTypeDto): Promise<StudentLinkType> {
    const existing = await this.findOne(id);
    const merged = this.repo.merge(existing, dto);
    await this.repo.save(merged);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.repo.remove(existing);
  }
}
