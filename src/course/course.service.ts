import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { Course } from './entities/course.entity';
import { Module } from '../module/entities/module.entity';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
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
      relations: ['company', 'modules'],
    });
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['company', 'modules'],
    });
    
    if (!course) {
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

  async addModuleToCourse(courseId: number, moduleId: number): Promise<Course> {
    const course = await this.findOne(courseId);
    const module = await this.moduleRepository.findOne({ where: { id: moduleId } });
    
    if (!module) {
      throw new NotFoundException(`Module with ID ${moduleId} not found`);
    }
    
    if (!course.modules) {
      course.modules = [];
    }
    
    if (!course.modules.find(m => m.id === moduleId)) {
      course.modules.push(module);
      return await this.courseRepository.save(course);
    }
    
    return course;
  }

  async removeModuleFromCourse(courseId: number, moduleId: number): Promise<Course> {
    const course = await this.findOne(courseId);
    
    if (course.modules) {
      course.modules = course.modules.filter(m => m.id !== moduleId);
      return await this.courseRepository.save(course);
    }
    
    return course;
  }
}
