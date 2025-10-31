import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAdministratorDto } from './dto/create-administrator.dto';
import { UpdateAdministratorDto } from './dto/update-administrator.dto';
import { AdministratorsQueryDto } from './dto/administrators-query.dto';
import { Administrator } from './entities/administrator.entity';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class AdministratorsService {
  constructor(
    @InjectRepository(Administrator)
    private administratorRepository: Repository<Administrator>,
  ) {}

  async create(createAdministratorDto: CreateAdministratorDto): Promise<Administrator> {
    try {
      const created = this.administratorRepository.create(createAdministratorDto);
      const saved = await this.administratorRepository.save(created);
      return this.findOne(saved.id);
    } catch (error) {
      throw new BadRequestException('Failed to create administrator');
    }
  }

  async findAll(query: AdministratorsQueryDto): Promise<PaginatedResponseDto<Administrator>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const qb = this.administratorRepository.createQueryBuilder('a')
      .leftJoinAndSelect('a.classRoom', 'classRoom')
      .leftJoinAndSelect('a.company', 'company');

    if (query.search) {
      qb.andWhere(
        '(a.first_name LIKE :search OR a.last_name LIKE :search OR a.email LIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    if (query.company_id) qb.andWhere('a.company_id = :company_id', { company_id: query.company_id });
    if (query.class_room_id) qb.andWhere('a.class_room_id = :class_room_id', { class_room_id: query.class_room_id });

    qb.skip((page - 1) * limit).take(limit).orderBy('a.id', 'DESC');

    const [data, total] = await qb.getManyAndCount();
    return PaginationService.createResponse(data, page, limit, total);
  }

  async findOne(id: number): Promise<Administrator> {
    const found = await this.administratorRepository.findOne({
      where: { id },
      relations: ['classRoom', 'company'],
    });
    if (!found) throw new NotFoundException('Administrator not found');
    return found;
  }

  async update(id: number, updateAdministratorDto: UpdateAdministratorDto): Promise<Administrator> {
    const existing = await this.findOne(id);
    const merged = this.administratorRepository.merge(existing, updateAdministratorDto);
    await this.administratorRepository.save(merged);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    await this.administratorRepository.remove(existing);
  }
}

