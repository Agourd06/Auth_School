import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateStudentDiplomeDto } from './dto/create-student-diplome.dto';
import { UpdateStudentDiplomeDto } from './dto/update-student-diplome.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentDiplome } from './entities/student-diplome.entity';

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

  async findAll(): Promise<StudentDiplome[]> {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number): Promise<StudentDiplome> {
    const found = await this.repo.findOne({ where: { id } });
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
