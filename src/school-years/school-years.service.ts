import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolYear } from './entities/school-year.entity';
import { CreateSchoolYearDto } from './dto/create-school-year.dto';
import { UpdateSchoolYearDto } from './dto/update-school-year.dto';
import { Company } from 'src/company/entities/company.entity';

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

  findAll() {
    return this.schoolYearRepo.find({ relations: ['company'] });
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
