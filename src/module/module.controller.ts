import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ModuleService } from './module.service';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ModuleQueryDto } from './dto/module-query.dto';
import { CourseAssignmentDto } from './dto/course-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Modules')
@ApiBearerAuth()
@Controller('module')
export class ModuleController {
  constructor(private readonly moduleService: ModuleService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 201, description: 'Module created successfully.' })
  create(@Request() req, @Body() createModuleDto: CreateModuleDto) {
    const companyId = req.user.company_id;
    if (!companyId) {
      throw new BadRequestException('User must belong to a company');
    }
    return this.moduleService.create(createModuleDto, companyId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Retrieve modules with pagination metadata.' })
  findAll(@Request() req, @Query() queryDto: ModuleQueryDto) {
    const companyId = req.user.company_id;
    if (!companyId) {
      throw new BadRequestException('User must belong to a company');
    }
    return this.moduleService.findAllWithPagination(queryDto, companyId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Retrieve a module by identifier.' })
  findOne(@Request() req, @Param('id') id: string) {
    const companyId = req.user.company_id;
    if (!companyId) {
      throw new BadRequestException('User must belong to a company');
    }
    return this.moduleService.findOne(+id, companyId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Update a module.' })
  update(@Request() req, @Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto) {
    const companyId = req.user.company_id;
    if (!companyId) {
      throw new BadRequestException('User must belong to a company');
    }
    return this.moduleService.update(+id, updateModuleDto, companyId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Remove a module.' })
  remove(@Request() req, @Param('id') id: string) {
    const companyId = req.user.company_id;
    if (!companyId) {
      throw new BadRequestException('User must belong to a company');
    }
    return this.moduleService.remove(+id, companyId);
  }

  @Get(':id/courses')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Retrieve assigned and unassigned courses for a module.' })
  getModuleCourses(@Request() req, @Param('id') id: string) {
    const companyId = req.user.company_id;
    if (!companyId) {
      throw new BadRequestException('User must belong to a company');
    }
    return this.moduleService.getModuleCourses(+id, companyId);
  }

  @Post(':id/courses')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Batch assign or unassign courses for a module.' })
  batchManageModuleCourses(
    @Request() req,
    @Param('id') id: string,
    @Body() assignmentDto: CourseAssignmentDto,
  ) {
    const companyId = req.user.company_id;
    if (!companyId) {
      throw new BadRequestException('User must belong to a company');
    }
    return this.moduleService.batchManageModuleCourses(+id, assignmentDto, companyId);
  }

  @Post(':id/courses/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Attach a single course to a module.' })
  addCourseToModule(@Request() req, @Param('id') id: string, @Param('courseId') courseId: string) {
    const companyId = req.user.company_id;
    if (!companyId) {
      throw new BadRequestException('User must belong to a company');
    }
    return this.moduleService.addCourseToModule(+id, +courseId, companyId);
  }

  @Delete(':id/courses/:courseId')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Detach a course from a module.' })
  removeCourseFromModule(@Request() req, @Param('id') id: string, @Param('courseId') courseId: string) {
    const companyId = req.user.company_id;
    if (!companyId) {
      throw new BadRequestException('User must belong to a company');
    }
    return this.moduleService.removeCourseFromModule(+id, +courseId, companyId);
  }
}
