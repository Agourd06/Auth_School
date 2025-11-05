import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';
import { CompanyQueryDto } from './dto/company-query.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company)
    private companyRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const company = this.companyRepository.create(createCompanyDto);
    return await this.companyRepository.save(company);
  }

  async findAll(query: CompanyQueryDto): Promise<PaginatedResponseDto<Company>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const qb = this.companyRepository.createQueryBuilder('c').leftJoinAndSelect('c.users', 'users');

    qb.andWhere('c.status <> :deletedStatus', { deletedStatus: -2 });

    if (query.search) {
      qb.andWhere('(c.name LIKE :search OR c.email LIKE :search)', { search: `%${query.search}%` });
    }

    if (query.status !== undefined) {
      qb.andWhere('c.status = :status', { status: query.status });
    }

    qb.orderBy('c.id', 'DESC').skip((page - 1) * limit).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { id, status: Not(-2) },
      relations: ['users'],
    });
    
    if (!company) {
      throw new NotFoundException(`Company with ID ${id} not found`);
    }
    
    return company;
  }

  async update(id: number, updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    const company = await this.findOne(id);
    
    Object.assign(company, updateCompanyDto);
    return await this.companyRepository.save(company);
  }

  async remove(id: number): Promise<void> {
    const company = await this.findOne(id);
    await this.companyRepository.remove(company);
  }
}
