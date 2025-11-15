import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';
import { ClassEntity } from './entities/class.entity';
import { ClassQueryDto } from './dto/class-query.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class ClassService {
  constructor(
    @InjectRepository(ClassEntity)
    private repo: Repository<ClassEntity>,
  ) {}

  async create(dto: CreateClassDto, companyId: number): Promise<ClassEntity> {
    try {
      // Always set company_id from authenticated user
      const dtoWithCompany = {
        ...dto,
        company_id: companyId,
      };
      const created = this.repo.create(dtoWithCompany);
      const saved = await this.repo.save(created);
      return this.findOne(saved.id, companyId);
    } catch (error) {
      throw new BadRequestException('Failed to create class');
    }
  }

  async findAll(query: ClassQueryDto, companyId: number): Promise<PaginatedResponseDto<ClassEntity>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const qb = this.repo.createQueryBuilder('c')
      .leftJoinAndSelect('c.program', 'program')
      .leftJoinAndSelect('c.specialization', 'specialization')
      .leftJoinAndSelect('c.level', 'level')
      .leftJoinAndSelect('c.schoolYear', 'schoolYear')
      .leftJoinAndSelect('c.schoolYearPeriod', 'schoolYearPeriod');
      
    qb.andWhere('c.status <> :deletedStatus', { deletedStatus: -2 });
    // Always filter by company_id from authenticated user
    qb.andWhere('c.company_id = :company_id', { company_id: companyId });

    if (query.search) {
      qb.andWhere('(c.title LIKE :search OR c.description LIKE :search)', {
        search: `%${query.search}%`,
      });
    }
    if (query.program_id) qb.andWhere('c.program_id = :program_id', { program_id: query.program_id });
    if (query.specialization_id) qb.andWhere('c.specialization_id = :specialization_id', { specialization_id: query.specialization_id });
    if (query.level_id) qb.andWhere('c.level_id = :level_id', { level_id: query.level_id });
    if (query.school_year_id) qb.andWhere('c.school_year_id = :school_year_id', { school_year_id: query.school_year_id });
    if (query.school_year_period_id) qb.andWhere('c.school_year_period_id = :school_year_period_id', { school_year_period_id: query.school_year_period_id });
    if (query.status !== undefined) qb.andWhere('c.status = :status', { status: query.status });

    qb.skip((page - 1) * limit).take(limit).orderBy('c.id', 'DESC');

    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number, companyId: number): Promise<ClassEntity> {
    const found = await this.repo.findOne({
      where: { id, company_id: companyId, status: Not(-2) },
      relations: ['program', 'specialization', 'level', 'schoolYear', 'schoolYearPeriod'],
    });
    if (!found) throw new NotFoundException('Class not found');
    return found;
  }

  async update(id: number, dto: UpdateClassDto, companyId: number): Promise<ClassEntity> {
    const existing = await this.findOne(id, companyId);
    
    // Prevent changing company_id - always use authenticated user's company
    const dtoWithoutCompany = { ...dto };
    delete (dtoWithoutCompany as any).company_id;
    
    const merged = this.repo.merge(existing, dtoWithoutCompany);
    // Ensure company_id remains from authenticated user
    merged.company_id = companyId;
    merged.company = { id: companyId } as any;
    
    const relationMappings = {
      program_id: 'program',
      specialization_id: 'specialization',
      level_id: 'level',
      school_year_id: 'schoolYear',
      school_year_period_id: 'schoolYearPeriod',
    } as const;

    (Object.entries(relationMappings) as Array<[keyof UpdateClassDto, keyof ClassEntity]>).forEach(([idProp, relationProp]) => {
      const value = (dto as any)[idProp];
      if (value !== undefined) {
        (merged as any)[idProp] = value;
        // Handle optional relations (school_year_period_id) - allow null
        if (idProp === 'school_year_period_id') {
          (merged as any)[relationProp] = value ? ({ id: value } as any) : null;
        } else {
          (merged as any)[relationProp] = value ? ({ id: value } as any) : undefined;
        }
      }
    });

    await this.repo.save(merged);
    return this.findOne(id, companyId);
  }

  async remove(id: number, companyId: number): Promise<void> {
    const existing = await this.findOne(id, companyId);
    await this.repo.remove(existing);
  }
}
