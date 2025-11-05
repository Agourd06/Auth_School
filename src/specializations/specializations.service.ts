import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateSpecializationDto } from './dto/create-specialization.dto';
import { UpdateSpecializationDto } from './dto/update-specialization.dto';
import { Specialization } from './entities/specialization.entity';
import { SpecializationQueryDto } from './dto/specialization-query.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class SpecializationsService {
  constructor(
    @InjectRepository(Specialization)
    private repo: Repository<Specialization>,
  ) {}

  async create(dto: CreateSpecializationDto): Promise<Specialization> {
    try {
      const created = this.repo.create(dto);
      const saved = await this.repo.save(created);
      return this.findOne(saved.id);
    } catch (error) {
      throw new BadRequestException('Failed to create specialization');
    }
  }

  async findAll(query: SpecializationQueryDto): Promise<PaginatedResponseDto<Specialization>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const qb = this.repo.createQueryBuilder('s').leftJoinAndSelect('s.program', 'p');

    qb.andWhere('s.status <> :deletedStatus', { deletedStatus: -2 });

    if (query.search) qb.andWhere('s.title LIKE :search', { search: `%${query.search}%` });
    if (query.status !== undefined) qb.andWhere('s.status = :status', { status: query.status });
    if (query.program_id) qb.andWhere('s.program_id = :program_id', { program_id: query.program_id });
    if (query.company_id) qb.andWhere('s.company_id = :company_id', { company_id: query.company_id });

    qb.skip((page - 1) * limit).take(limit).orderBy('s.id', 'DESC');

    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number): Promise<Specialization> {
    const found = await this.repo.findOne({
      where: { id, status: Not(-2) },
      relations: ['program'],
    });
    if (!found) throw new NotFoundException('Specialization not found');
    return found;
  }

  async update(id: number, dto: UpdateSpecializationDto): Promise<Specialization> {
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
