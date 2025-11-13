import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { CreateStudentAttestationDto } from './dto/create-studentattestation.dto';
import { UpdateStudentAttestationDto } from './dto/update-studentattestation.dto';
import { StudentAttestationQueryDto } from './dto/studentattestation-query.dto';
import { StudentAttestation } from './entities/studentattestation.entity';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';
import { Student } from '../students/entities/student.entity';
import { Attestation } from '../attestation/entities/attestation.entity';
import { Company } from '../company/entities/company.entity';

@Injectable()
export class StudentattestationService {
  constructor(
    @InjectRepository(StudentAttestation)
    private readonly studentAttestationRepository: Repository<StudentAttestation>,
    @InjectRepository(Student)
    private readonly studentRepository: Repository<Student>,
    @InjectRepository(Attestation)
    private readonly attestationRepository: Repository<Attestation>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(createStudentAttestationDto: CreateStudentAttestationDto): Promise<StudentAttestation> {
    // Validate student exists and is not deleted
    const student = await this.studentRepository.findOne({
      where: { id: createStudentAttestationDto.Idstudent, status: Not(-2) },
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${createStudentAttestationDto.Idstudent} not found`);
    }

    // Validate attestation exists and is not deleted
    const attestation = await this.attestationRepository.findOne({
      where: { id: createStudentAttestationDto.Idattestation, statut: Not(-2) },
    });
    if (!attestation) {
      throw new NotFoundException(`Attestation with ID ${createStudentAttestationDto.Idattestation} not found`);
    }

    // Validate company exists and is not deleted
    if (createStudentAttestationDto.companyid) {
      const company = await this.companyRepository.findOne({
        where: { id: createStudentAttestationDto.companyid, status: Not(-2) },
      });
      if (!company) {
        throw new NotFoundException(`Company with ID ${createStudentAttestationDto.companyid} not found`);
      }
    }

    // Validate dateask is before datedelivery
    this.validateDateRange(createStudentAttestationDto.dateask, createStudentAttestationDto.datedelivery);

    const studentAttestation = this.studentAttestationRepository.create({
      Idstudent: createStudentAttestationDto.Idstudent,
      Idattestation: createStudentAttestationDto.Idattestation,
      dateask: createStudentAttestationDto.dateask,
      datedelivery: createStudentAttestationDto.datedelivery,
      Status: createStudentAttestationDto.Status ?? 1,
      companyid: createStudentAttestationDto.companyid,
    });

    return await this.studentAttestationRepository.save(studentAttestation);
  }

  async findAll(queryDto: StudentAttestationQueryDto): Promise<PaginatedResponseDto<StudentAttestation>> {
    const { page = 1, limit = 10, search, Status, Idstudent, Idattestation, companyid } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.studentAttestationRepository
      .createQueryBuilder('studentAttestation')
      .leftJoinAndSelect('studentAttestation.student', 'student')
      .leftJoinAndSelect('studentAttestation.attestation', 'attestation')
      .leftJoinAndSelect('studentAttestation.company', 'company')
      .skip(skip)
      .take(limit)
      .orderBy('studentAttestation.created_at', 'DESC');

    // Exclude soft-deleted records (Status = -2)
    queryBuilder.andWhere('studentAttestation.Status <> :deletedStatus', { deletedStatus: -2 });

    // Add search filter for student name or attestation title
    if (search) {
      queryBuilder.andWhere(
        '(student.first_name LIKE :search OR student.last_name LIKE :search OR student.email LIKE :search OR attestation.title LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Add status filter
    if (Status !== undefined) {
      queryBuilder.andWhere('studentAttestation.Status = :Status', { Status });
    }

    // Add student filter
    if (Idstudent !== undefined) {
      queryBuilder.andWhere('studentAttestation.Idstudent = :Idstudent', { Idstudent });
    }

    // Add attestation filter
    if (Idattestation !== undefined) {
      queryBuilder.andWhere('studentAttestation.Idattestation = :Idattestation', { Idattestation });
    }

    // Add company filter
    if (companyid !== undefined) {
      queryBuilder.andWhere('studentAttestation.companyid = :companyid', { companyid });
    }

    const [studentAttestations, total] = await queryBuilder.getManyAndCount();

    return PaginationService.createResponse(studentAttestations, page, limit, total);
  }

  async findOne(id: number): Promise<StudentAttestation> {
    const studentAttestation = await this.studentAttestationRepository.findOne({
      where: { id, Status: Not(-2) },
      relations: ['student', 'attestation', 'company'],
    });

    if (!studentAttestation) {
      throw new NotFoundException(`StudentAttestation with ID ${id} not found`);
    }

    return studentAttestation;
  }

  async update(id: number, updateStudentAttestationDto: UpdateStudentAttestationDto): Promise<StudentAttestation> {
    const studentAttestation = await this.findOne(id);

    // Validate student if provided
    if (updateStudentAttestationDto.Idstudent) {
      const student = await this.studentRepository.findOne({
        where: { id: updateStudentAttestationDto.Idstudent, status: Not(-2) },
      });
      if (!student) {
        throw new NotFoundException(`Student with ID ${updateStudentAttestationDto.Idstudent} not found`);
      }
    }

    // Validate attestation if provided
    if (updateStudentAttestationDto.Idattestation) {
      const attestation = await this.attestationRepository.findOne({
        where: { id: updateStudentAttestationDto.Idattestation, statut: Not(-2) },
      });
      if (!attestation) {
        throw new NotFoundException(`Attestation with ID ${updateStudentAttestationDto.Idattestation} not found`);
      }
    }

    // Validate company if provided
    if (updateStudentAttestationDto.companyid) {
      const company = await this.companyRepository.findOne({
        where: { id: updateStudentAttestationDto.companyid, status: Not(-2) },
      });
      if (!company) {
        throw new NotFoundException(`Company with ID ${updateStudentAttestationDto.companyid} not found`);
      }
    }

    // Validate dateask is before datedelivery (check both new values and existing values)
    const finalDateAsk = updateStudentAttestationDto.dateask ?? studentAttestation.dateask;
    const finalDateDelivery = updateStudentAttestationDto.datedelivery ?? studentAttestation.datedelivery;
    this.validateDateRange(finalDateAsk, finalDateDelivery);

    Object.assign(studentAttestation, updateStudentAttestationDto);
    const savedStudentAttestation = await this.studentAttestationRepository.save(studentAttestation);

    return this.findOne(savedStudentAttestation.id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    // Soft delete: set Status to -2
    existing.Status = -2;
    await this.studentAttestationRepository.save(existing);
  }

  private validateDateRange(dateask: string | undefined, datedelivery: string | undefined): void {
    // If both dates are provided, validate that dateask is before datedelivery
    if (dateask && datedelivery) {
      const askDate = new Date(dateask);
      const deliveryDate = new Date(datedelivery);

      if (isNaN(askDate.getTime()) || isNaN(deliveryDate.getTime())) {
        throw new BadRequestException('Invalid dateask or datedelivery format');
      }

      if (deliveryDate <= askDate) {
        throw new BadRequestException('datedelivery must be greater than dateask');
      }
    }
  }
}
