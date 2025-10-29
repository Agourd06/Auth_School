import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolYearPeriod } from './entities/school-year-period.entity';
import { CreateSchoolYearPeriodDto } from './dto/create-school-year-period.dto';
import { UpdateSchoolYearPeriodDto } from './dto/update-school-year-period.dto';
import { SchoolYear } from 'src/school-years/entities/school-year.entity';
import { SchoolYearPeriodQueryDto } from './dto/school-year-period-query.dto';

@Injectable()
export class SchoolYearPeriodsService {
  constructor(
    @InjectRepository(SchoolYearPeriod)
    private readonly periodRepo: Repository<SchoolYearPeriod>,
    @InjectRepository(SchoolYear)
    private readonly schoolYearRepo: Repository<SchoolYear>,
  ) {}

  private mapStatus(s: any): number {
    if (typeof s === 'number' && !Number.isNaN(s)) return s;
    if (s == null) return 2;
    const lower = String(s).toLowerCase();
    if (['disabled', '0'].includes(lower)) return 0;
    if (['active', '1'].includes(lower)) return 1;
    if (['pending', '2'].includes(lower)) return 2;
    if (['archiver', 'archived', 'archive', '-1'].includes(lower)) return -1;
    if (['deleted', '-2'].includes(lower)) return -2;
    const parsed = parseInt(lower, 10);
    return Number.isNaN(parsed) ? 2 : parsed;
  }

  async create(dto: CreateSchoolYearPeriodDto) {
    const parent = await this.schoolYearRepo.findOne({ where: { id: dto.schoolYearId } });
    if (!parent) throw new NotFoundException('Parent school year not found');

    const start = new Date(dto.start_date);
    const end = new Date(dto.end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid start_date or end_date');
    }
    if (end <= start) {
      throw new BadRequestException('end_date must be greater than start_date');
    }

    const period = this.periodRepo.create({
      title: dto.title,
      start_date: dto.start_date,
      end_date: dto.end_date,
      status: this.mapStatus(dto.status),
      schoolYear: parent,
    });
    return this.periodRepo.save(period);
  }

  async findAll(query?: SchoolYearPeriodQueryDto) {
    const q = query ?? ({} as SchoolYearPeriodQueryDto);
    const page = Math.max(1, q.page || 1);
    const limit = Math.min(100, q.limit || 10);
    const offset = (page - 1) * limit;

    const qb = this.periodRepo.createQueryBuilder('p').leftJoinAndSelect('p.schoolYear', 'schoolYear');

    if (q.title) {
      qb.andWhere('p.title LIKE :title', { title: `%${q.title}%` });
    }

    if (typeof q.status === 'number') {
      qb.andWhere('p.status = :status', { status: q.status });
    }

    qb.orderBy('p.id', 'DESC').skip(offset).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit) || 1,
      },
    };
  }

  async findOne(id: number) {
    const period = await this.periodRepo.findOne({ where: { id }, relations: ['schoolYear'] });
    if (!period) throw new NotFoundException('School year period not found');
    return period;
  }

  async update(id: number, dto: UpdateSchoolYearPeriodDto) {
    const period = await this.findOne(id);

    if (dto.schoolYearId) {
      const parent = await this.schoolYearRepo.findOne({ where: { id: dto.schoolYearId } });
      if (!parent) throw new NotFoundException('Parent school year not found');
      period.schoolYear = parent;
    }

    const start = dto.start_date ? new Date(dto.start_date) : new Date(period.start_date);
    const end = dto.end_date ? new Date(dto.end_date) : new Date(period.end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid start_date or end_date');
    }
    if (end <= start) {
      throw new BadRequestException('end_date must be greater than start_date');
    }

    if (dto.title !== undefined) period.title = dto.title;
    if (dto.start_date !== undefined) period.start_date = start;
    if (dto.end_date !== undefined) period.end_date = end;
    if (dto.status !== undefined) period.status = this.mapStatus(dto.status);

    return this.periodRepo.save(period);
  }

  async remove(id: number) {
    const period = await this.findOne(id);
    return this.periodRepo.remove(period);
  }  }

