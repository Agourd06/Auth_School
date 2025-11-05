import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Level } from './entities/level.entity';
import { CreateLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { LevelQueryDto } from './dto/level-query.dto';
import { PaginationService } from '../common/services/pagination.service';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';

@Injectable()
export class LevelService {
  constructor(
    @InjectRepository(Level)
    private repo: Repository<Level>,
  ) {}

  async create(dto: CreateLevelDto): Promise<Level> {
    try {
      const created = this.repo.create(dto);
      const saved = await this.repo.save(created);
      return this.findOne(saved.id);
    } catch (e) {
      throw new BadRequestException('Failed to create level');
    }
  }

  async findAll(query: LevelQueryDto): Promise<PaginatedResponseDto<Level>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const qb = this.repo.createQueryBuilder('l')
      .leftJoinAndSelect('l.specialization', 's')
      .leftJoinAndSelect('s.program', 'p');

    qb.andWhere('l.status <> :deletedStatus', { deletedStatus: -2 });

    if (query.search) qb.andWhere('l.title LIKE :search', { search: `%${query.search}%` });
    if (query.specialization_id) qb.andWhere('l.specialization_id = :sid', { sid: query.specialization_id });
    if (query.status !== undefined) qb.andWhere('l.status = :status', { status: query.status });
    qb.skip((page - 1) * limit).take(limit).orderBy('l.id', 'DESC');
    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number): Promise<Level> {
    const found = await this.repo.findOne({
      where: { id, status: Not(-2) },
      relations: ['specialization', 'specialization.program'],
    });
    if (!found) throw new NotFoundException('Level not found');
    return found;
  }

  async update(id: number, dto: UpdateLevelDto): Promise<Level> {
    const existing = await this.findOne(id);
    const merged = this.repo.merge(existing, dto);
    if (dto.specialization_id !== undefined) {
      merged.specialization_id = dto.specialization_id;
      merged.specialization = dto.specialization_id ? ({ id: dto.specialization_id } as any) : undefined;
    }
    await this.repo.save(merged);
    return this.findOne(id);   
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.repo.remove(existing);
  }
}
