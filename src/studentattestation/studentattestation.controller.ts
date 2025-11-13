import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StudentattestationService } from './studentattestation.service';
import { CreateStudentAttestationDto } from './dto/create-studentattestation.dto';
import { UpdateStudentAttestationDto } from './dto/update-studentattestation.dto';
import { StudentAttestationQueryDto } from './dto/studentattestation-query.dto';

@ApiTags('StudentAttestation')
@ApiBearerAuth()
@Controller('studentattestation')
export class StudentattestationController {
  constructor(private readonly studentattestationService: StudentattestationService) {}

  @Post()
  @ApiResponse({ status: 201, description: 'StudentAttestation created successfully.' })
  create(@Body() createStudentAttestationDto: CreateStudentAttestationDto) {
    return this.studentattestationService.create(createStudentAttestationDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Retrieve student attestations with pagination metadata.' })
  findAll(@Query() queryDto: StudentAttestationQueryDto) {
    return this.studentattestationService.findAll(queryDto);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Retrieve a student attestation by identifier.' })
  findOne(@Param('id') id: string) {
    return this.studentattestationService.findOne(+id);
  }

  @Patch(':id')
  @ApiResponse({ status: 200, description: 'Update a student attestation.' })
  update(@Param('id') id: string, @Body() updateStudentAttestationDto: UpdateStudentAttestationDto) {
    return this.studentattestationService.update(+id, updateStudentAttestationDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Soft delete a student attestation (sets Status to -2).' })
  remove(@Param('id') id: string) {
    return this.studentattestationService.remove(+id);
  }
}
