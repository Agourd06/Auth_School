import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolYear } from './entities/school-year.entity';
import { CreateSchoolYearDto } from './dto/create-school-year.dto';
import { UpdateSchoolYearDto } from './dto/update-school-year.dto';
import { Company } from 'src/company/entities/company.entity';
import { SchoolYearQueryDto } from './dto/school-year-query.dto';

@Injectable()
export class SchoolYearsService {
  constructor(
    @InjectRepository(SchoolYear)
    private readonly schoolYearRepo: Repository<SchoolYear>,
    @InjectRepository(Company)
    private readonly companyRepo: Repository<Company>,
  ) {}

  async create(dto: CreateSchoolYearDto) {
    const company = await this.companyRepo.findOne({ where: { id: dto.companyId } });
    if (!company) throw new NotFoundException('Company not found');

    const start = new Date(dto.start_date);
    const end = new Date(dto.end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid start_date or end_date');
    }
    if (end <= start) {
      throw new BadRequestException('end_date must be greater than start_date');
    }

    const schoolYear = this.schoolYearRepo.create({
      title: dto.title,
      start_date: dto.start_date,
      end_date: dto.end_date,
      status: dto.status ,
      company,
    });
    return this.schoolYearRepo.save(schoolYear);
  }

  async findAll(query?: SchoolYearQueryDto) {
    const q = query ?? ({} as SchoolYearQueryDto);
    const page = Math.max(1, q.page || 1);
    const limit = Math.min(100, q.limit || 10);
    const offset = (page - 1) * limit;

    const qb = this.schoolYearRepo.createQueryBuilder('sy')
      .leftJoinAndSelect('sy.company', 'company');

    if (q.title) {
      qb.andWhere('sy.title LIKE :title', { title: `%${q.title}%` });
    }

    if (typeof q.status === 'number') {
      qb.andWhere('sy.status = :status', { status: q.status });
    }

    qb.orderBy('sy.id', 'DESC')
      .skip(offset)
      .take(limit);

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
    const schoolYear = await this.schoolYearRepo.findOne({ where: { id }, relations: ['company'] });
    if (!schoolYear) throw new NotFoundException('School year not found');
    return schoolYear;
  }

  async update(id: number, dto: UpdateSchoolYearDto) {
    const schoolYear = await this.findOne(id);
    Object.assign(schoolYear, dto);
    return this.schoolYearRepo.save(schoolYear);
  }

  async remove(id: number) {
    const schoolYear = await this.findOne(id);
    return this.schoolYearRepo.remove(schoolYear);
  }
}

