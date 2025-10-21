import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { Module } from './entities/module.entity';
import { Course } from '../course/entities/course.entity';

@Injectable()
export class ModuleService {
  constructor(
    @InjectRepository(Module)
    private moduleRepository: Repository<Module>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
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

  async addCourseToModule(moduleId: number, courseId: number): Promise<Module> {
    const module = await this.findOne(moduleId);
    const course = await this.courseRepository.findOne({ where: { id: courseId } });
    
    if (!course) {
      throw new NotFoundException(`Course with ID ${courseId} not found`);
    }
    
    if (!module.courses) {
      module.courses = [];
    }
    
    if (!module.courses.find(c => c.id === courseId)) {
      module.courses.push(course);
      return await this.moduleRepository.save(module);
    }
    
    return module;
  }

  async removeCourseFromModule(moduleId: number, courseId: number): Promise<Module> {
    const module = await this.findOne(moduleId);
    
    if (module.courses) {
      module.courses = module.courses.filter(c => c.id !== courseId);
      return await this.moduleRepository.save(module);
    }
    
    return module;
  }
}
