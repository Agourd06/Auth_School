import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Not } from 'typeorm';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseQueryDto } from './dto/course-query.dto';
import { ModuleAssignmentDto, CourseModulesResponseDto } from './dto/module-assignment.dto';
import { Course } from './entities/course.entity';
import { Module } from '../module/entities/module.entity';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    private dataSource: DataSource,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const courseData = {
      ...createCourseDto,
      intitule: createCourseDto.title,
      statut: createCourseDto.status,
    };
    const course = this.courseRepository.create(courseData);
    
    // Handle module relationships if provided
    if (createCourseDto.module_ids && createCourseDto.module_ids.length > 0) {
      const modules = await this.moduleRepository.findByIds(createCourseDto.module_ids);
      course.modules = modules;
    }
    
    return await this.courseRepository.save(course);
  }

  async findAll(): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { statut: Not(-2) } as any,
      relations: ['company', 'modules'],
    });
  }

  async findAllWithPagination(queryDto: CourseQueryDto): Promise<PaginatedResponseDto<Course>> {
    const { page = 1, limit = 10, search, status } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.company', 'company')
      .leftJoinAndSelect('course.modules', 'modules')
      .skip(skip)
      .take(limit)
      .orderBy('course.created_at', 'DESC');

    queryBuilder.andWhere('course.statut <> :deletedStatus', { deletedStatus: -2 });

    // Add search filter
    if (search) {
      queryBuilder.andWhere('course.intitule LIKE :search', { search: `%${search}%` });
    }

    // Add status filter
    if (status !== undefined) {
      queryBuilder.andWhere('course.statut = :status', { status });
    }

    const [courses, total] = await queryBuilder.getManyAndCount();

    return PaginationService.createResponse(courses, page, limit, total);
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['company', 'modules'],
    });
    
    if (!course || (course as any).statut === -2) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }
    
    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);
    
    // Handle module relationships if provided
    if (updateCourseDto.module_ids !== undefined) {
      if (updateCourseDto.module_ids.length > 0) {
        const modules = await this.moduleRepository.findByIds(updateCourseDto.module_ids);
        course.modules = modules;
      } else {
        course.modules = [];
      }
    }
    
    const updateData = {
      ...updateCourseDto,
      intitule: updateCourseDto.title,
      statut: updateCourseDto.status,
    };
    Object.assign(course, updateData);
    return await this.courseRepository.save(course);
  }

  async remove(id: number): Promise<void> {
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);
  }


  /**
   * Get modules assigned and unassigned to a course for drag-and-drop interface
   */
  async getCourseModules(courseId: number): Promise<CourseModulesResponseDto> {
    // Verify course exists
    await this.findOne(courseId);

    // Get assigned modules
    const assignedModules = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.modules', 'modules')
      .leftJoinAndSelect('modules.company', 'company')
      .where('course.id = :courseId', { courseId })
      .getOne();

    // Get all modules not assigned to this course
    const unassignedModules = await this.moduleRepository
      .createQueryBuilder('module')
      .leftJoinAndSelect('module.company', 'company')
      .where('module.id NOT IN (SELECT mc.module_id FROM module_course mc WHERE mc.course_id = :courseId)', { courseId })
      .orderBy('module.created_at', 'DESC')
      .getMany();

    return {
      assigned: assignedModules?.modules || [],
      unassigned: unassignedModules,
    };
  }

  /**
   * Batch assign/unassign modules to/from a course
   */
  async batchManageCourseModules(courseId: number, assignmentDto: ModuleAssignmentDto): Promise<{ message: string; affected: number }> {
    // Verify course exists
    await this.findOne(courseId);

    if (!assignmentDto.add?.length && !assignmentDto.remove?.length) {
      throw new BadRequestException('At least one operation (add or remove) must be specified');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let affectedCount = 0;

      // Handle module additions
      if (assignmentDto.add?.length) {
        // Verify all modules exist
        const modulesToAdd = await this.moduleRepository.findByIds(assignmentDto.add);
        if (modulesToAdd.length !== assignmentDto.add.length) {
          const foundIds = modulesToAdd.map(m => m.id);
          const missingIds = assignmentDto.add.filter(id => !foundIds.includes(id));
          throw new NotFoundException(`Modules with IDs ${missingIds.join(', ')} not found`);
        }

        // Insert new relationships
        for (const moduleId of assignmentDto.add) {
          await queryRunner.query(
            'INSERT IGNORE INTO module_course (module_id, course_id, created_at) VALUES (?, ?, NOW())',
            [moduleId, courseId]
          );
        }
        affectedCount += assignmentDto.add.length;
      }

      // Handle module removals
      if (assignmentDto.remove?.length) {
        // Remove relationships
        await queryRunner.query(
          'DELETE FROM module_course WHERE course_id = ? AND module_id IN (?)',
          [courseId, assignmentDto.remove]
        );
        affectedCount += assignmentDto.remove.length;
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Module assignments updated successfully',
        affected: affectedCount,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Add a single module to a course
   */
  async addModuleToCourse(courseId: number, moduleId: number): Promise<{ message: string; module: any }> {
    // Verify course exists
    await this.findOne(courseId);

    // Verify module exists
    const module = await this.moduleRepository.findOne({ 
      where: { id: moduleId },
      relations: ['company']
    });
    
    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if relationship already exists
      const existingRelation = await queryRunner.query(
        'SELECT * FROM module_course WHERE course_id = ? AND module_id = ?',
        [courseId, moduleId]
      );

      if (existingRelation.length > 0) {
        throw new BadRequestException('Module is already assigned to this course');
      }

      // Insert new relationship
      await queryRunner.query(
        'INSERT INTO module_course (module_id, course_id, created_at) VALUES (?, ?, NOW())',
        [moduleId, courseId]
      );

      await queryRunner.commitTransaction();

      return {
        message: 'Module successfully assigned to course',
        module: module,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Remove a single module from a course
   */
  async removeModuleFromCourse(courseId: number, moduleId: number): Promise<{ message: string }> {
    // Verify course exists
    await this.findOne(courseId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if relationship exists
      const existingRelation = await queryRunner.query(
        'SELECT * FROM module_course WHERE course_id = ? AND module_id = ?',
        [courseId, moduleId]
      );

      if (existingRelation.length === 0) {
        throw new BadRequestException('Module is not assigned to this course');
      }

      // Remove relationship
      await queryRunner.query(
        'DELETE FROM module_course WHERE course_id = ? AND module_id = ?',
        [courseId, moduleId]
      );

      await queryRunner.commitTransaction();

      return {
        message: 'Module successfully removed from course',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
