import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { CreateAttestationDto } from './dto/create-attestation.dto';
import { UpdateAttestationDto } from './dto/update-attestation.dto';
import { AttestationQueryDto } from './dto/attestation-query.dto';
import { Attestation } from './entities/attestation.entity';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';
import { Company } from '../company/entities/company.entity';

@Injectable()
export class AttestationService {
  constructor(
    @InjectRepository(Attestation)
    private readonly attestationRepository: Repository<Attestation>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(createAttestationDto: CreateAttestationDto): Promise<Attestation> {
    // Validate company exists and is not deleted
    if (createAttestationDto.companyid) {
      const company = await this.companyRepository.findOne({
        where: { id: createAttestationDto.companyid, status: Not(-2) },
      });
      if (!company) {
        throw new NotFoundException(`Company with ID ${createAttestationDto.companyid} not found`);
      }
    }

    const attestation = this.attestationRepository.create({
      title: createAttestationDto.title,
      description: createAttestationDto.description,
      statut: createAttestationDto.statut ?? 1,
      companyid: createAttestationDto.companyid,
    });

    return await this.attestationRepository.save(attestation);
  }

  async findAll(queryDto: AttestationQueryDto): Promise<PaginatedResponseDto<Attestation>> {
    const { page = 1, limit = 10, search, statut } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.attestationRepository
      .createQueryBuilder('attestation')
      .leftJoinAndSelect('attestation.company', 'company')
      .skip(skip)
      .take(limit)
      .orderBy('attestation.created_at', 'DESC');

    // Exclude soft-deleted records (statut = -2)
    queryBuilder.andWhere('attestation.statut <> :deletedStatus', { deletedStatus: -2 });

    // Add search filter for title or description
    if (search) {
      queryBuilder.andWhere(
        '(attestation.title LIKE :search OR attestation.description LIKE :search)',
        { search: `%${search}%` }
      );
    }

    // Add status filter
    if (statut !== undefined) {
      queryBuilder.andWhere('attestation.statut = :statut', { statut });
    }

    const [attestations, total] = await queryBuilder.getManyAndCount();

    return PaginationService.createResponse(attestations, page, limit, total);
  }

  async findOne(id: number): Promise<Attestation> {
    const attestation = await this.attestationRepository.findOne({
      where: { id, statut: Not(-2) },
      relations: ['company'],
    });

    if (!attestation) {
      throw new NotFoundException(`Attestation with ID ${id} not found`);
    }

    return attestation;
  }

  async update(id: number, updateAttestationDto: UpdateAttestationDto): Promise<Attestation> {
    const attestation = await this.findOne(id);

    // Validate company if provided
    if (updateAttestationDto.companyid) {
      const company = await this.companyRepository.findOne({
        where: { id: updateAttestationDto.companyid, status: Not(-2) },
      });
      if (!company) {
        throw new NotFoundException(`Company with ID ${updateAttestationDto.companyid} not found`);
      }
    }

    Object.assign(attestation, updateAttestationDto);
    const savedAttestation = await this.attestationRepository.save(attestation);

    return this.findOne(savedAttestation.id);
  }

  async remove(id: number): Promise<void> {
    const existing = await this.findOne(id);
    // Soft delete: set statut to -2
    existing.statut = -2;
    await this.attestationRepository.save(existing);
  }
}
