import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateStudentLinkTypeDto } from './dto/create-studentlinktype.dto';
import { UpdateStudentLinkTypeDto } from './dto/update-studentlinktype.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentLinkType } from './entities/studentlinktype.entity';

@Injectable()
export class StudentlinktypeService {
  constructor(
    @InjectRepository(StudentLinkType)
    private repo: Repository<StudentLinkType>,
  ) {}

  async create(dto: CreateStudentLinkTypeDto): Promise<StudentLinkType> {
    try {
      const created = this.repo.create(dto);
      const saved = await this.repo.save(created);
      return this.findOne(saved.id);
    } catch (e) {
      throw new BadRequestException('Failed to create student link type');
    }
  }

  async findAll(): Promise<StudentLinkType[]> {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number): Promise<StudentLinkType> {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Student link type not found');
    return found;
  }

  async update(id: number, dto: UpdateStudentLinkTypeDto): Promise<StudentLinkType> {
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
