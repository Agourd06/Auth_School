import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateStudentLinkTypeDto } from './dto/create-studentlinktype.dto';
import { UpdateStudentLinkTypeDto } from './dto/update-studentlinktype.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
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

  async create(dto: CreateStudentLinkTypeDto, companyId: number): Promise<StudentLinkType> {
    try {
      // Always set company_id from authenticated user
      const dtoWithCompany = {
        ...dto,
        company_id: companyId,
      };
      const created = this.repo.create(dtoWithCompany);
      const saved = await this.repo.save(created);
      return this.findOne(saved.id, companyId);
    } catch (e) {
      throw new BadRequestException('Failed to create student link type');
    }
  }

  async findAll(query: StudentLinkTypeQueryDto, companyId: number): Promise<PaginatedResponseDto<StudentLinkType>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const qb = this.repo.createQueryBuilder('t');
    qb.andWhere('t.status <> :deletedStatus', { deletedStatus: -2 });
    // Always filter by company_id from authenticated user
    qb.andWhere('t.company_id = :company_id', { company_id: companyId });
    if (query.search) qb.andWhere('t.title LIKE :search', { search: `%${query.search}%` });
    if (query.status !== undefined) qb.andWhere('t.status = :status', { status: query.status });
    qb.skip((page - 1) * limit).take(limit).orderBy('t.id', 'DESC');
    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number, companyId: number): Promise<StudentLinkType> {
    const found = await this.repo.findOne({ where: { id, company_id: companyId, status: Not(-2) } });
    if (!found) throw new NotFoundException('Student link type not found');
    return found;
  }

  async update(id: number, dto: UpdateStudentLinkTypeDto, companyId: number): Promise<StudentLinkType> {
    const existing = await this.findOne(id, companyId);

    // Prevent changing company_id - always use authenticated user's company
    const dtoWithoutCompany = { ...dto };
    delete (dtoWithoutCompany as any).company_id;

    const merged = this.repo.merge(existing, dtoWithoutCompany);
    // Ensure company_id remains from authenticated user
    merged.company_id = companyId;
    merged.company = { id: companyId } as any;
    await this.repo.save(merged);
    return this.findOne(id, companyId);
  }

  async remove(id: number, companyId: number): Promise<void> {
    const existing = await this.findOne(id, companyId);
    await this.repo.remove(existing);
  }
}
