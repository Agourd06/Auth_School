import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePlanningSessionTypeDto } from './dto/create-planning-session-type.dto';
import { UpdatePlanningSessionTypeDto } from './dto/update-planning-session-type.dto';
import { PlanningSessionType } from './entities/planning-session-type.entity';
import { PlanningSessionTypesQueryDto } from './dto/planning-session-types-query.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class PlanningSessionTypesService {
  constructor(
    @InjectRepository(PlanningSessionType)
    private readonly repo: Repository<PlanningSessionType>,
  ) {}

  async create(dto: CreatePlanningSessionTypeDto): Promise<PlanningSessionType> {
    const entity = this.repo.create({
      ...dto,
      status: dto.status ?? 'active',
    });

    const saved = await this.repo.save(entity);
    return this.findOne(saved.id);
  }

  async findAll(query: PlanningSessionTypesQueryDto): Promise<PaginatedResponseDto<PlanningSessionType>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const qb = this.repo
      .createQueryBuilder('type')
      .leftJoinAndSelect('type.company', 'company')
      .orderBy('type.title', 'ASC')
      .skip((page - 1) * limit)
      .take(limit);

    if (query.status) {
      qb.andWhere('type.status = :status', { status: query.status });
    }

    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number): Promise<PlanningSessionType> {
    const found = await this.repo.findOne({ where: { id }, relations: ['company'] });
    if (!found) {
      throw new NotFoundException('Planning session type not found');
    }
    return found;
  }

  async update(id: number, dto: UpdatePlanningSessionTypeDto): Promise<PlanningSessionType> {
    const existing = await this.findOne(id);
    const merged = this.repo.merge(existing, dto);
    return this.repo.save(merged);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.repo.remove(existing);
  }
}
