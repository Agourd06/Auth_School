import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateStudentLinkTypeDto } from './dto/create-studentlinktype.dto';
import { UpdateStudentLinkTypeDto } from './dto/update-studentlinktype.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { StudentLinkType } from './entities/studentlinktype.entity';
import { StudentLinkTypeQueryDto } from './dto/studentlinktype-query.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';
import { Student } from '../students/entities/student.entity';

@Injectable()
export class StudentlinktypeService {
  constructor(
    @InjectRepository(StudentLinkType)
    private repo: Repository<StudentLinkType>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
  ) {}

  async create(dto: CreateStudentLinkTypeDto, companyId: number): Promise<StudentLinkType> {
    try {
      // If student_id is provided, verify it exists and belongs to the same company
      if (dto.student_id) {
        const student = await this.studentRepo.findOne({
          where: { id: dto.student_id, company_id: companyId },
        });
        if (!student) {
          throw new BadRequestException('Student not found or does not belong to your company');
        }
      }

      // Always set company_id from authenticated user
      const dtoWithCompany = {
        ...dto,
        company_id: companyId,
      };
      const created = this.repo.create(dtoWithCompany);
      const saved = await this.repo.save(created);
      return this.findOne(saved.id, companyId);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to create student link type');
    }
  }

  async findAll(query: StudentLinkTypeQueryDto, companyId: number): Promise<PaginatedResponseDto<StudentLinkType>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const qb = this.repo.createQueryBuilder('t');
    qb.leftJoinAndSelect('t.student', 'student');
    qb.andWhere('t.status <> :deletedStatus', { deletedStatus: -2 });
    // Always filter by company_id from authenticated user
    qb.andWhere('t.company_id = :company_id', { company_id: companyId });
    if (query.search) qb.andWhere('t.title LIKE :search', { search: `%${query.search}%` });
    if (query.status !== undefined) qb.andWhere('t.status = :status', { status: query.status });
    if (query.student_id) qb.andWhere('t.student_id = :student_id', { student_id: query.student_id });
    qb.skip((page - 1) * limit).take(limit).orderBy('t.id', 'DESC');
    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number, companyId: number): Promise<StudentLinkType> {
    const found = await this.repo.findOne({ 
      where: { id, company_id: companyId, status: Not(-2) },
      relations: ['student'],
    });
    if (!found) throw new NotFoundException('Student link type not found');
    return found;
  }

  async update(id: number, dto: UpdateStudentLinkTypeDto, companyId: number): Promise<StudentLinkType> {
    const existing = await this.findOne(id, companyId);

    // If student_id is being updated, verify it belongs to the same company
    if (dto.student_id !== undefined) {
      const student = await this.studentRepo.findOne({
        where: { id: dto.student_id, company_id: companyId },
      });
      if (!student) {
        throw new BadRequestException('Student not found or does not belong to your company');
      }
    }

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
