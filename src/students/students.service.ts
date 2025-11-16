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
import { StudentLinkType } from '../studentlinktype/entities/studentlinktype.entity';
import { ClassRoom } from '../class-rooms/entities/class-room.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(ClassRoom)
    private classRoomRepository: Repository<ClassRoom>,
    @InjectRepository(StudentDiplome)
    private studentDiplomeRepository: Repository<StudentDiplome>,
    @InjectRepository(StudentContact)
    private studentContactRepository: Repository<StudentContact>,
    @InjectRepository(StudentLinkType)
    private studentLinkTypeRepository: Repository<StudentLinkType>,
    private dataSource: DataSource,
  ) {}

  async create(createStudentDto: CreateStudentDto, companyId: number): Promise<Student> {
    try {
      // Verify class room exists and belongs to the same company if provided
      if (createStudentDto.class_room_id) {
        const classRoom = await this.classRoomRepository.findOne({
          where: { id: createStudentDto.class_room_id, company_id: companyId, status: Not(-2) },
        });
        if (!classRoom) {
          throw new NotFoundException(`Class room with ID ${createStudentDto.class_room_id} not found or does not belong to your company`);
        }
      }

      // Always set company_id from authenticated user
      const dtoWithCompany = {
        ...createStudentDto,
        company_id: companyId,
      };
      const created = this.studentRepository.create(dtoWithCompany);
      const saved = await this.studentRepository.save(created);
      return this.findOne(saved.id, companyId); // Return with relations loaded
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to create student');
    }
  }

  async findAll(query: StudentsQueryDto, companyId: number): Promise<PaginatedResponseDto<Student>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const qb = this.studentRepository.createQueryBuilder('s')
      .leftJoinAndSelect('s.classRoom', 'classRoom')
      .leftJoinAndSelect('s.company', 'company');

    qb.andWhere('s.status <> :deletedStatus', { deletedStatus: -2 });
    // Always filter by company_id from authenticated user
    qb.andWhere('s.company_id = :company_id', { company_id: companyId });

    if (query.search) {
      qb.andWhere(
        '(s.first_name LIKE :search OR s.last_name LIKE :search OR s.email LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.class_room_id) qb.andWhere('s.class_room_id = :class_room_id', { class_room_id: query.class_room_id });
    if (query.status !== undefined) qb.andWhere('s.status = :status', { status: query.status });

    qb.skip((page - 1) * limit).take(limit).orderBy('s.id', 'DESC');

    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number, companyId: number): Promise<Student> {
    const found = await this.studentRepository.findOne({
      where: { id, company_id: companyId, status: Not(-2) },
      relations: ['classRoom', 'company'],
    });
    if (!found) throw new NotFoundException('Student not found');
    return found;
  }

  async findOneWithDetails(id: number, companyId: number) {
    // Get student
    const student = await this.studentRepository.findOne({
      where: { id, company_id: companyId, status: Not(-2) },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    // Get student's most recent diploma (one only)
    const diploma = await this.studentDiplomeRepository.findOne({
      where: { student_id: id, company_id: companyId, status: Not(-2) },
      order: { created_at: 'DESC' },
    });

    // Get student's most recent contact with link type (one only)
    const contact = await this.studentContactRepository.findOne({
      where: { student_id: id, company_id: companyId, status: Not(-2) },
      
      order: { created_at: 'DESC' },
    });

    // Get student's most recent link type (one only)
    const linkType = await this.studentLinkTypeRepository.findOne({
      where: { student_id: id, company_id: companyId, status: Not(-2) },
    
      order: { created_at: 'DESC' },
    });

    return {
      student,
      diploma,
      contact,
      linkType,
    };
  }

  async update(id: number, updateStudentDto: UpdateStudentDto, companyId: number): Promise<Student> {
    const existing = await this.findOne(id, companyId);

    // If class_room_id is being updated, verify it belongs to the same company
    if (updateStudentDto.class_room_id !== undefined) {
      if (updateStudentDto.class_room_id) {
        const classRoom = await this.classRoomRepository.findOne({
          where: { id: updateStudentDto.class_room_id, company_id: companyId, status: Not(-2) },
        });
        if (!classRoom) {
          throw new NotFoundException(`Class room with ID ${updateStudentDto.class_room_id} not found or does not belong to your company`);
        }
      }
    }

    // Prevent changing company_id - always use authenticated user's company
    const dtoWithoutCompany = { ...updateStudentDto };
    delete (dtoWithoutCompany as any).company_id;

    const merged = this.studentRepository.merge(existing, dtoWithoutCompany);
    const relationMappings = {
      class_room_id: 'classRoom',
    } as const;

    (Object.entries(relationMappings) as Array<[keyof UpdateStudentDto, keyof Student]>).forEach(([idProp, relationProp]) => {
      const value = (updateStudentDto as any)[idProp];
      if (value !== undefined) {
        (merged as any)[idProp] = value;
        // Handle optional relations (class_room_id) - allow null
        if (idProp === 'class_room_id') {
          (merged as any)[relationProp] = value ? ({ id: value } as any) : null;
        } else {
          (merged as any)[relationProp] = value ? ({ id: value } as any) : undefined;
        }
      }
    });

    // Ensure company_id remains from authenticated user
    merged.company_id = companyId;
    merged.company = { id: companyId } as any;

    await this.studentRepository.save(merged);
    return this.findOne(id, companyId); // Return with relations loaded
  }

  async remove(id: number, companyId: number): Promise<void> {
    await this.softDeleteStudent(id, companyId);
  }

  async softDeleteStudent(id: number, companyId: number): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      // 1️⃣ Find the student first and verify it belongs to the company
      const student = await manager.findOne(Student, { where: { id, company_id: companyId, status: Not(-2) } });
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
