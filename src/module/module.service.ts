import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { ModuleQueryDto } from './dto/module-query.dto';
import { CourseAssignmentDto, ModuleCoursesResponseDto } from './dto/course-assignment.dto';
import { Module } from './entities/module.entity';
import { Course } from '../course/entities/course.entity';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    private dataSource: DataSource,
  ) {}

  async create(createModuleDto: CreateModuleDto): Promise<Module> {
    const moduleData = {
      ...createModuleDto,
      intitule: createModuleDto.title,
      statut: createModuleDto.status,
    };
    const module = this.moduleRepository.create(moduleData);
    
    // Handle course relationships if provided
    if (createModuleDto.course_ids && createModuleDto.course_ids.length > 0) {
      const courses = await this.courseRepository.findByIds(createModuleDto.course_ids);
      module.courses = courses;
    }
    
    return await this.moduleRepository.save(module);
  }

  async findAll(): Promise<Module[]> {
    return await this.moduleRepository.find({
      relations: ['company', 'courses'],
    });
  }

  async findAllWithPagination(queryDto: ModuleQueryDto): Promise<PaginatedResponseDto<Module>> {
    const { page = 1, limit = 10, search, status } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.moduleRepository
      .createQueryBuilder('module')
      .leftJoinAndSelect('module.company', 'company')
      .leftJoinAndSelect('module.courses', 'courses')
      .skip(skip)
      .take(limit)
      .orderBy('module.created_at', 'DESC');

    // Add search filter
    if (search) {
      queryBuilder.andWhere('module.intitule LIKE :search', { search: `%${search}%` });
    }

    // Add status filter
    if (status !== undefined) {
      queryBuilder.andWhere('module.statut = :status', { status });
    }

    const [modules, total] = await queryBuilder.getManyAndCount();

    return PaginationService.createResponse(modules, page, limit, total);
  }

  async findOne(id: number): Promise<Module> {
    const module = await this.moduleRepository.findOne({
      where: { id },
      relations: ['company', 'courses'],
    });
    
    if (!module) {
      throw new NotFoundException(`Module with ID ${id} not found`);
    }
    
    return module;
  }

  async update(id: number, updateModuleDto: UpdateModuleDto): Promise<Module> {
    const module = await this.findOne(id);
    
    // Handle course relationships if provided
    if (updateModuleDto.course_ids !== undefined) {
      if (updateModuleDto.course_ids.length > 0) {
        const courses = await this.courseRepository.findByIds(updateModuleDto.course_ids);
        module.courses = courses;
      } else {
        module.courses = [];
      }
    }
    
    const updateData = {
      ...updateModuleDto,
      intitule: updateModuleDto.title,
      statut: updateModuleDto.status,
    };
    Object.assign(module, updateData);
    return await this.moduleRepository.save(module);
  }

  async remove(id: number): Promise<void> {
    const module = await this.findOne(id);
    await this.moduleRepository.remove(module);
  }


  /**
   * Get courses assigned and unassigned to a module for drag-and-drop interface
   */
  async getModuleCourses(moduleId: number): Promise<ModuleCoursesResponseDto> {
    // Verify module exists
    await this.findOne(moduleId);

    // Get assigned courses
    const assignedCourses = await this.moduleRepository
      .createQueryBuilder('module')
      .leftJoinAndSelect('module.courses', 'courses')
      .leftJoinAndSelect('courses.company', 'company')
      .where('module.id = :moduleId', { moduleId })
      .getOne();

    // Get all courses not assigned to this module
    const unassignedCourses = await this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.company', 'company')
      .where('course.id NOT IN (SELECT mc.course_id FROM module_course mc WHERE mc.module_id = :moduleId)', { moduleId })
      .orderBy('course.created_at', 'DESC')
      .getMany();

    return {
      assigned: assignedCourses?.courses || [],
      unassigned: unassignedCourses,
    };
  }

  /**
   * Batch assign/unassign courses to/from a module
   */
  async batchManageModuleCourses(moduleId: number, assignmentDto: CourseAssignmentDto): Promise<{ message: string; affected: number }> {
    // Verify module exists
    await this.findOne(moduleId);

    if (!assignmentDto.add?.length && !assignmentDto.remove?.length) {
      throw new BadRequestException('At least one operation (add or remove) must be specified');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let affectedCount = 0;

      // Handle course additions
      if (assignmentDto.add?.length) {
        // Verify all courses exist
        const coursesToAdd = await this.courseRepository.findByIds(assignmentDto.add);
        if (coursesToAdd.length !== assignmentDto.add.length) {
          const foundIds = coursesToAdd.map(c => c.id);
          const missingIds = assignmentDto.add.filter(id => !foundIds.includes(id));
          throw new NotFoundException(`Courses with IDs ${missingIds.join(', ')} not found`);
        }

        // Insert new relationships
        for (const courseId of assignmentDto.add) {
          await queryRunner.query(
            'INSERT IGNORE INTO module_course (module_id, course_id, created_at) VALUES (?, ?, NOW())',
            [moduleId, courseId]
          );
        }
        affectedCount += assignmentDto.add.length;
      }

      // Handle course removals
      if (assignmentDto.remove?.length) {
        // Remove relationships
        await queryRunner.query(
          'DELETE FROM module_course WHERE module_id = ? AND course_id IN (?)',
          [moduleId, assignmentDto.remove]
        );
        affectedCount += assignmentDto.remove.length;
      }

      await queryRunner.commitTransaction();

      return {
        message: 'Course assignments updated successfully',
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
   * Add a single course to a module
   */
  async addCourseToModule(moduleId: number, courseId: number): Promise<{ message: string; course: any }> {
    // Verify module exists
    await this.findOne(moduleId);

    // Verify course exists
    const course = await this.courseRepository.findOne({ 
      where: { id: courseId },
      relations: ['company']
    });
    
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if relationship already exists
      const existingRelation = await queryRunner.query(
        'SELECT * FROM module_course WHERE module_id = ? AND course_id = ?',
        [moduleId, courseId]
      );

      if (existingRelation.length > 0) {
        throw new BadRequestException('Course is already assigned to this module');
      }

      // Insert new relationship
      await queryRunner.query(
        'INSERT INTO module_course (module_id, course_id, created_at) VALUES (?, ?, NOW())',
        [moduleId, courseId]
      );

      await queryRunner.commitTransaction();

      return {
        message: 'Course successfully assigned to module',
        course: course,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Remove a single course from a module
   */
  async removeCourseFromModule(moduleId: number, courseId: number): Promise<{ message: string }> {
    // Verify module exists
    await this.findOne(moduleId);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if relationship exists
      const existingRelation = await queryRunner.query(
        'SELECT * FROM module_course WHERE module_id = ? AND course_id = ?',
        [moduleId, courseId]
      );

      if (existingRelation.length === 0) {
        throw new BadRequestException('Course is not assigned to this module');
      }

      // Remove relationship
      await queryRunner.query(
        'DELETE FROM module_course WHERE module_id = ? AND course_id = ?',
        [moduleId, courseId]
      );

      await queryRunner.commitTransaction();

      return {
        message: 'Course successfully removed from module',
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
