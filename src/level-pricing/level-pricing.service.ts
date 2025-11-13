import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateLevelPricingDto } from './dto/create-level-pricing.dto';
import { UpdateLevelPricingDto } from './dto/update-level-pricing.dto';
import { LevelPricing } from './entities/level-pricing.entity';
import { LevelPricingQueryDto } from './dto/level-pricing-query.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class LevelPricingService {
  constructor(
    @InjectRepository(LevelPricing)
    private readonly repo: Repository<LevelPricing>,
  ) {}

  async create(dto: CreateLevelPricingDto): Promise<LevelPricing> {
    const entity = this.repo.create({
      ...dto,
      status: dto.status ?? 2,
      occurrences: dto.occurrences ?? 1,
      every_month: dto.every_month ?? 0,
    });

    const saved = await this.repo.save(entity);
    return this.findOne(saved.id);
  }

  async findAll(query: LevelPricingQueryDto): Promise<PaginatedResponseDto<LevelPricing>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.repo
      .createQueryBuilder('pricing')
      .leftJoinAndSelect('pricing.level', 'level')
      .leftJoinAndSelect('pricing.company', 'company')
      .where('pricing.status <> :deletedStatus', { deletedStatus: -2 })
      .orderBy('pricing.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status !== undefined) {
      qb.andWhere('pricing.status = :status', { status: query.status });
    }

    if (query.level_id) {
      qb.andWhere('pricing.level_id = :level_id', { level_id: query.level_id });
    }

    if (query.company_id) {
      qb.andWhere('pricing.company_id = :company_id', { company_id: query.company_id });
    }

    if (query.search) {
      qb.andWhere('pricing.title LIKE :search', { search: `%${query.search}%` });
    }

    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number): Promise<LevelPricing> {
    const pricing = await this.repo.findOne({
      where: { id, status: Not(-2) },
      relations: ['level', 'company'],
    });
    if (!pricing) {
      throw new NotFoundException('Level pricing not found');
    }
    return pricing;
  }

  async update(id: number, dto: UpdateLevelPricingDto): Promise<LevelPricing> {
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
