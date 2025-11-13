import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateStudentContactDto } from './dto/create-student-contact.dto';
import { UpdateStudentContactDto } from './dto/update-student-contact.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { StudentContact } from './entities/student-contact.entity';
import { StudentContactQueryDto } from './dto/student-contact-query.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';
import { Student } from '../students/entities/student.entity';

@Injectable()
export class StudentContactService {
  constructor(
    @InjectRepository(StudentContact)
    private repo: Repository<StudentContact>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  async create(dto: CreateStudentContactDto): Promise<StudentContact> {
    // Validate student exists and is not deleted
    if (dto.student_id) {
      const student = await this.studentRepository.findOne({
        where: { id: dto.student_id, status: Not(-2) },
      });
      if (!student) {
        throw new NotFoundException(`Student with ID ${dto.student_id} not found`);
      }
    }

    try {
      const created = this.repo.create(dto);
      const saved = await this.repo.save(created);
      return this.findOne(saved.id);
    } catch (e) {
      throw new BadRequestException('Failed to create student contact');
    }
  }

  async findAll(query: StudentContactQueryDto): Promise<PaginatedResponseDto<StudentContact>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const qb = this.repo.createQueryBuilder('c')
      .leftJoinAndSelect('c.student', 'student')
      .leftJoinAndSelect('c.studentLinkType', 'studentLinkType');

    qb.andWhere('c.status <> :deletedStatus', { deletedStatus: -2 });

    if (query.search) {
      qb.andWhere(
        '(c.firstname LIKE :search OR c.lastname LIKE :search OR c.email LIKE :search OR c.phone LIKE :search OR c.city LIKE :search OR c.country LIKE :search)',
        { search: `%${query.search}%` },
      );
    }
    if (query.student_id) qb.andWhere('c.student_id = :student_id', { student_id: query.student_id });
    if (query.studentlinktypeId) qb.andWhere('c.studentlinktypeId = :sid', { sid: query.studentlinktypeId });
    if (query.status !== undefined) qb.andWhere('c.status = :status', { status: query.status });

    qb.skip((page - 1) * limit).take(limit).orderBy('c.id', 'DESC');
    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number): Promise<StudentContact> {
    const found = await this.repo.findOne({ where: { id, status: Not(-2) }, relations: ['student', 'studentLinkType'] });
    if (!found) throw new NotFoundException('Student contact not found');
    return found;
  }

  async update(id: number, dto: UpdateStudentContactDto): Promise<StudentContact> {
    const existing = await this.findOne(id);

    // Validate student if provided
    if (dto.student_id) {
      const student = await this.studentRepository.findOne({
        where: { id: dto.student_id, status: Not(-2) },
      });
      if (!student) {
        throw new NotFoundException(`Student with ID ${dto.student_id} not found`);
      }
    }

    const merged = this.repo.merge(existing, dto);
    const relationMappings = {
      student_id: 'student',
      studentlinktypeId: 'studentLinkType',
      company_id: 'company',
    } as const;

    (Object.entries(relationMappings) as Array<[keyof UpdateStudentContactDto, keyof StudentContact]>).forEach(([idProp, relationProp]) => {
      const value = (dto as any)[idProp];
      if (value !== undefined) {
        (merged as any)[idProp] = value;
        (merged as any)[relationProp] = value ? ({ id: value } as any) : undefined;
      }
    });
    await this.repo.save(merged);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    // Soft delete: set status to -2
    existing.status = -2;
    await this.repo.save(existing);
  }
}
