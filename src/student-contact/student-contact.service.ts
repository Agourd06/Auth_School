import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateStudentContactDto } from './dto/create-student-contact.dto';
import { UpdateStudentContactDto } from './dto/update-student-contact.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { StudentContact } from './entities/student-contact.entity';
import { StudentContactQueryDto } from './dto/student-contact-query.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class StudentContactService {
  constructor(
    @InjectRepository(StudentContact)
    private repo: Repository<StudentContact>,
  ) {}

  async create(dto: CreateStudentContactDto): Promise<StudentContact> {
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
      .leftJoinAndSelect('c.studentLinkType', 'studentLinkType');

    qb.andWhere('c.status <> :deletedStatus', { deletedStatus: -2 });

    if (query.search) {
      qb.andWhere(
        '(c.firstname LIKE :search OR c.lastname LIKE :search OR c.email LIKE :search OR c.phone LIKE :search OR c.city LIKE :search OR c.country LIKE :search)',
        { search: `%${query.search}%` },
      );
    }
    if (query.studentlinktypeId) qb.andWhere('c.studentlinktypeId = :sid', { sid: query.studentlinktypeId });
    if (query.status !== undefined) qb.andWhere('c.status = :status', { status: query.status });

    qb.skip((page - 1) * limit).take(limit).orderBy('c.id', 'DESC');
    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number): Promise<StudentContact> {
    const found = await this.repo.findOne({ where: { id, status: Not(-2) }, relations: ['studentLinkType'] });
    if (!found) throw new NotFoundException('Student contact not found');
    return found;
  }

  async update(id: number, dto: UpdateStudentContactDto): Promise<StudentContact> {
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
