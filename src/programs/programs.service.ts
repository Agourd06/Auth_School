import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Program } from './entities/program.entity';
import { CreateProgramDto } from './dto/create-program.dto';
import { UpdateProgramDto } from './dto/update-program.dto';
import { ProgramQueryDto } from './dto/program-query.dto';
import { PaginationService } from '../common/services/pagination.service';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';

@Injectable()
export class ProgramService {
  constructor(
    @InjectRepository(Program)
    private repo: Repository<Program>,
  ) {}

  async create(dto: CreateProgramDto): Promise<Program> {
    try {
      const created = this.repo.create(dto);
      const saved = await this.repo.save(created);
      return this.findOne(saved.id);
    } catch {
      throw new BadRequestException('Failed to create program');
    }
  }

  async findAll(query: ProgramQueryDto): Promise<PaginatedResponseDto<Program>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const qb = this.repo.createQueryBuilder('p').leftJoinAndSelect('p.specializations', 's');
    if (query.search) qb.andWhere('p.title LIKE :search', { search: `%${query.search}%` });
    if (query.status !== undefined) qb.andWhere('p.status = :status', { status: query.status });
    qb.skip((page - 1) * limit).take(limit).orderBy('p.id', 'DESC');
    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number): Promise<Program> {
    const found = await this.repo.findOne({ where: { id }, relations: ['specializations'] });
    if (!found) throw new NotFoundException('Program not found');
    return found;
  }

  async update(id: number, dto: UpdateProgramDto): Promise<Program> {
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
