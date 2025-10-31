import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateStudentContactDto } from './dto/create-student-contact.dto';
import { UpdateStudentContactDto } from './dto/update-student-contact.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentContact } from './entities/student-contact.entity';

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

  async findAll(): Promise<StudentContact[]> {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number): Promise<StudentContact> {
    const found = await this.repo.findOne({ where: { id }, relations: ['studentLinkType'] });
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
