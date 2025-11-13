import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AttestationService } from './attestation.service';
import { CreateAttestationDto } from './dto/create-attestation.dto';
import { UpdateAttestationDto } from './dto/update-attestation.dto';
import { AttestationQueryDto } from './dto/attestation-query.dto';

@ApiTags('Attestation')
@ApiBearerAuth()
@Controller('attestation')
export class AttestationController {
  constructor(private readonly attestationService: AttestationService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'Attestation created successfully.' })
  create(@Body() createAttestationDto: CreateAttestationDto) {
    return this.attestationService.create(createAttestationDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Retrieve attestations with pagination metadata.' })
  findAll(@Query() queryDto: AttestationQueryDto) {
    return this.attestationService.findAll(queryDto);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Retrieve an attestation by identifier.' })
  findOne(@Param('id') id: string) {
    return this.attestationService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Update an attestation.' })
  update(@Param('id') id: string, @Body() updateAttestationDto: UpdateAttestationDto) {
    return this.attestationService.update(+id, updateAttestationDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Soft delete an attestation (sets statut to -2).' })
  remove(@Param('id') id: string) {
    return this.attestationService.remove(+id);
  }
}
