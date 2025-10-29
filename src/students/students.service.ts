import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsQueryDto } from './dto/students-query.dto';
import { Student } from './entities/student.entity';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    try {
      const created = this.studentRepository.create(createStudentDto);
      const saved = await this.studentRepository.save(created);
      return this.findOne(saved.id); // Return with relations loaded
    } catch (error) {
      throw new BadRequestException('Failed to create student');
    }
  }

  async findAll(query: StudentsQueryDto): Promise<PaginatedResponseDto<Student>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const qb = this.studentRepository.createQueryBuilder('s')
      .leftJoinAndSelect('s.classRoom', 'classRoom')
      .leftJoinAndSelect('s.company', 'company');

    if (query.search) {
      qb.andWhere(
        '(s.code LIKE :search OR s.first_name LIKE :search OR s.last_name LIKE :search OR s.email LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.company_id) qb.andWhere('s.company_id = :company_id', { company_id: query.company_id });
    if (query.class_room_id) qb.andWhere('s.class_room_id = :class_room_id', { class_room_id: query.class_room_id });

    qb.skip((page - 1) * limit).take(limit).orderBy('s.id', 'DESC');

    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number): Promise<Student> {
    const found = await this.studentRepository.findOne({
      where: { id },
      relations: ['classRoom', 'company'],
    });
    if (!found) throw new NotFoundException('Student not found');
    return found;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const existing = await this.findOne(id);
    const merged = this.studentRepository.merge(existing, updateStudentDto);
    await this.studentRepository.save(merged);
    return this.findOne(id); // Return with relations loaded
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.studentRepository.remove(existing);
  }
}
