import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsQueryDto } from './dto/students-query.dto';
import { Student } from './entities/student.entity';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';
import { ClassStudent } from '../class-student/entities/class-student.entity';
import { StudentDiplome } from '../student-diplome/entities/student-diplome.entity';
import { StudentPayment } from '../student-payment/entities/student-payment.entity';
import { StudentReport } from '../student-report/entities/student-report.entity';
import { StudentAttestation } from '../studentattestation/entities/studentattestation.entity';
import { StudentPresence } from '../studentpresence/entities/studentpresence.entity';
import { StudentContact } from '../student-contact/entities/student-contact.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    private dataSource: DataSource,
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

    qb.andWhere('s.status <> :deletedStatus', { deletedStatus: -2 });

    if (query.search) {
      qb.andWhere(
        '(s.first_name LIKE :search OR s.last_name LIKE :search OR s.email LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.company_id) qb.andWhere('s.company_id = :company_id', { company_id: query.company_id });
    if (query.class_room_id) qb.andWhere('s.class_room_id = :class_room_id', { class_room_id: query.class_room_id });
    if (query.status !== undefined) qb.andWhere('s.status = :status', { status: query.status });

    qb.skip((page - 1) * limit).take(limit).orderBy('s.id', 'DESC');

    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number): Promise<Student> {
    const found = await this.studentRepository.findOne({
      where: { id, status: Not(-2) },
      relations: ['classRoom', 'company'],
    });
    if (!found) throw new NotFoundException('Student not found');
    return found;
  }

  async update(id: number, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const existing = await this.findOne(id);
    const merged = this.studentRepository.merge(existing, updateStudentDto);
    const relationMappings = {
      company_id: 'company',
      class_room_id: 'classRoom',
    } as const;

    (Object.entries(relationMappings) as Array<[keyof UpdateStudentDto, keyof Student]>).forEach(([idProp, relationProp]) => {
      const value = (updateStudentDto as any)[idProp];
      if (value !== undefined) {
        (merged as any)[idProp] = value;
        (merged as any)[relationProp] = value ? ({ id: value } as any) : undefined;
      }
    });

    await this.studentRepository.save(merged);
    return this.findOne(id); // Return with relations loaded
  }

  async remove(id: number): Promise<void> {
    await this.softDeleteStudent(id);
  }

  async softDeleteStudent(id: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // 1️⃣ Find the student first
      const student = await manager.findOne(Student, { where: { id, status: Not(-2) } });
      if (!student) {
        throw new NotFoundException(`Student with ID ${id} not found`);
      }

      // 2️⃣ Update student status to -2 (soft delete)
      await manager.update(Student, { id }, { status: -2 });

      // 3️⃣ Update related tables (soft delete all related resources that are not already deleted)
      // Using query builder for reliable updates in transaction
      
      // ClassStudent
      await manager
        .createQueryBuilder()
        .update(ClassStudent)
        .set({ status: -2 })
        .where('student_id = :id AND statut <> :deletedStatus', { id, deletedStatus: -2 })
        .execute();

      // StudentDiplome
      await manager
        .createQueryBuilder()
        .update(StudentDiplome)
        .set({ status: -2 })
        .where('student_id = :id AND statut <> :deletedStatus', { id, deletedStatus: -2 })
        .execute();

      // StudentPayment
      await manager
        .createQueryBuilder()
        .update(StudentPayment)
        .set({ status: -2 })
        .where('student_id = :id AND statut <> :deletedStatus', { id, deletedStatus: -2 })
        .execute();

      // StudentReport
      await manager
        .createQueryBuilder()
        .update(StudentReport)
        .set({ status: -2 })
        .where('student_id = :id AND statut <> :deletedStatus', { id, deletedStatus: -2 })
        .execute();

      // StudentAttestation (note: uses Idstudent and Status with capital S)
      await manager
        .createQueryBuilder()
        .update(StudentAttestation)
        .set({ Status: -2 })
        .where('Idstudent = :id AND Status <> :deletedStatus', { id, deletedStatus: -2 })
        .execute();

      // StudentPresence
      await manager
        .createQueryBuilder()
        .update(StudentPresence)
        .set({ status: -2 })
        .where('student_id = :id AND statut <> :deletedStatus', { id, deletedStatus: -2 })
        .execute();

      // StudentContact
      await manager
        .createQueryBuilder()
        .update(StudentContact)
        .set({ status: -2 })
        .where('student_id = :id AND statut <> :deletedStatus', { id, deletedStatus: -2 })
        .execute();
    });
  }
}
