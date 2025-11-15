import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseQueryDto } from './dto/course-query.dto';
import { ModuleAssignmentDto } from './dto/module-assignment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Courses')
@ApiBearerAuth()
@Controller('course')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 201, description: 'Course created successfully.' })
  create(@Request() req, @Body() createCourseDto: CreateCourseDto) {
    const companyId = req.user.company_id;
    if (!companyId) {
      throw new BadRequestException('User must belong to a company');
    }
    return this.courseService.create(createCourseDto, companyId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Retrieve courses with pagination metadata.' })
  findAll(@Request() req, @Query() queryDto: CourseQueryDto) {
    const companyId = req.user.company_id;
    if (!companyId) {
      throw new BadRequestException('User must belong to a company');
    }
    return this.courseService.findAllWithPagination(queryDto, companyId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Retrieve a course by identifier.' })
  findOne(@Request() req, @Param('id') id: string) {
    const companyId = req.user.company_id;
    if (!companyId) {
      throw new BadRequestException('User must belong to a company');
    }
    return this.courseService.findOne(+id, companyId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Update a course.' })
  update(@Request() req, @Param('id') id: string, @Body() updateCourseDto: UpdateCourseDto) {
    const companyId = req.user.company_id;
    if (!companyId) {
      throw new BadRequestException('User must belong to a company');
    }
    return this.courseService.update(+id, updateCourseDto, companyId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Remove a course.' })
  remove(@Request() req, @Param('id') id: string) {
    const companyId = req.user.company_id;
    if (!companyId) {
      throw new BadRequestException('User must belong to a company');
    }
    return this.courseService.remove(+id, companyId);
  }

  /**
   * Get modules assigned and unassigned to a course for drag-and-drop interface
   */
  @Get(':id/modules')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Retrieve assigned and unassigned modules for a course.' })
  getCourseModules(@Request() req, @Param('id') id: string) {
    const companyId = req.user.company_id;
    if (!companyId) {
      throw new BadRequestException('User must belong to a company');
    }
    return this.courseService.getCourseModules(+id, companyId);
  }

  /**
   * Batch assign/unassign modules to/from a course
   */
  @Post(':id/modules')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Batch assign or unassign modules for a course.' })
  batchManageCourseModules(
    @Request() req,
    @Param('id') id: string,
    @Body() assignmentDto: ModuleAssignmentDto,
  ) {
    const companyId = req.user.company_id;
    if (!companyId) {
      throw new BadRequestException('User must belong to a company');
    }
    return this.courseService.batchManageCourseModules(+id, assignmentDto, companyId);
  }

  /**
   * Add a single module to a course
   */
  @Post(':id/modules/:moduleId')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Assign a single module to a course.' })
  addModuleToCourse(@Request() req, @Param('id') id: string, @Param('moduleId') moduleId: string) {
    const companyId = req.user.company_id;
    if (!companyId) {
      throw new BadRequestException('User must belong to a company');
    }
    return this.courseService.addModuleToCourse(+id, +moduleId, companyId);
  }

  /**
   * Remove a single module from a course
   */
  @Delete(':id/modules/:moduleId')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({ status: 200, description: 'Remove a module from a course.' })
  removeModuleFromCourse(@Request() req, @Param('id') id: string, @Param('moduleId') moduleId: string) {
    const companyId = req.user.company_id;
    if (!companyId) {
      throw new BadRequestException('User must belong to a company');
    }
    return this.courseService.removeModuleFromCourse(+id, +moduleId, companyId);
  }
}
