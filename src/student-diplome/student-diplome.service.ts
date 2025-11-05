import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateStudentDiplomeDto } from './dto/create-student-diplome.dto';
import { UpdateStudentDiplomeDto } from './dto/update-student-diplome.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { StudentDiplome } from './entities/student-diplome.entity';
import { StudentDiplomesQueryDto } from './dto/student-diplomes-query.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class StudentDiplomeService {
  constructor(
    @InjectRepository(StudentDiplome)
    private repo: Repository<StudentDiplome>,
  ) {}

  async create(dto: CreateStudentDiplomeDto): Promise<StudentDiplome> {
    try {
      const created = this.repo.create(dto);
      const saved = await this.repo.save(created);
      return this.findOne(saved.id);
    } catch (e) {
      throw new BadRequestException('Failed to create student diplome');
    }
  }

  async findAll(query: StudentDiplomesQueryDto): Promise<PaginatedResponseDto<StudentDiplome>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const qb = this.repo.createQueryBuilder('d');

    qb.andWhere('d.status <> :deletedStatus', { deletedStatus: -2 });

    if (query.search) {
      qb.andWhere(
        '(d.title LIKE :search OR d.school LIKE :search OR d.diplome LIKE :search OR d.city LIKE :search OR d.country LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.student_id) qb.andWhere('d.student_id = :student_id', { student_id: query.student_id });
    if (query.annee) qb.andWhere('d.annee = :annee', { annee: query.annee });
    if (query.company_id) qb.andWhere('d.company_id = :company_id', { company_id: query.company_id });
    if (query.status !== undefined) qb.andWhere('d.status = :status', { status: query.status });

    qb.skip((page - 1) * limit).take(limit).orderBy('d.id', 'DESC');

    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number): Promise<StudentDiplome> {
    const found = await this.repo.findOne({ where: { id, status: Not(-2) } });
    if (!found) throw new NotFoundException('Student diplome not found');
    return found;
  }

  async update(id: number, dto: UpdateStudentDiplomeDto): Promise<StudentDiplome> {
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
