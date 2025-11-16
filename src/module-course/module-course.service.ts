import { Injectable, BadRequestException, NotFoundException, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateModuleCourseDto } from './dto/create-module-course.dto';
import { UpdateModuleCourseDto } from './dto/update-module-course.dto';
import { ModuleCourseQueryDto } from './dto/module-course-query.dto';
import { PaginatedResponseDto } from '../common/dto/pagination.dto';
import { PaginationService } from '../common/services/pagination.service';

@Injectable()
export class ModuleCourseService implements OnModuleInit {
  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit(): Promise<void> {
    await this.ensureSchema();
  }

  private async ensureSchema(): Promise<void> {
    const queries = [
      'ALTER TABLE module_course ADD COLUMN IF NOT EXISTS tri INT NOT NULL DEFAULT 0',
      'ALTER TABLE module_course ADD COLUMN IF NOT EXISTS volume INT NULL',
      'ALTER TABLE module_course ADD COLUMN IF NOT EXISTS coefficient DOUBLE NULL',
      'ALTER TABLE module_course ADD COLUMN IF NOT EXISTS status INT NOT NULL DEFAULT 1',
      'ALTER TABLE module_course ADD COLUMN IF NOT EXISTS created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP',
      'ALTER TABLE module_course ADD COLUMN IF NOT EXISTS updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP',
    ];

    for (const sql of queries) {
      try {
        await this.dataSource.query(sql);
      } catch (error) {
        if (error?.code !== 'ER_DUP_FIELDNAME') {
          throw error;
        }
      }
    }

    await this.dataSource.query(
      'CREATE UNIQUE INDEX IF NOT EXISTS idx_module_course_unique ON module_course (module_id, course_id)',
    ).catch(() => undefined);
  }

  async create(dto: CreateModuleCourseDto) {
    await this.ensureSchema();

    // Check if the relationship already exists (including deleted ones)
    const [existing] = await this.dataSource.query(
      'SELECT status FROM module_course WHERE module_id = ? AND course_id = ?',
      [dto.module_id, dto.course_id],
    );

    const tri = dto.tri ?? (await this.getNextTriForCourse(dto.course_id));
    const status = dto.status ?? 1; // Default to active (1)

    if (existing) {
      // If it exists and is deleted (status -2), restore it by updating status to 1
      if (Number(existing.status) === -2) {
        await this.dataSource.query(
          'UPDATE module_course SET tri = ?, volume = ?, coefficient = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE module_id = ? AND course_id = ?',
          [tri, dto.volume ?? null, dto.coefficient ?? null, status, dto.module_id, dto.course_id],
        );
        return this.findOne(dto.module_id, dto.course_id);
      } else {
        // If it exists and is not deleted, throw error
        throw new BadRequestException('Module already linked to this course');
      }
    }

    // If it doesn't exist, insert new record
    const result = await this.dataSource.query(
      'INSERT INTO module_course (module_id, course_id, tri, volume, coefficient, status) VALUES (?, ?, ?, ?, ?, ?)',
      [dto.module_id, dto.course_id, tri, dto.volume ?? null, dto.coefficient ?? null, status],
    );

    if (result.affectedRows === 0) {
      throw new BadRequestException('Failed to create module-course relation');
    }

    return this.findOne(dto.module_id, dto.course_id);
  }

  async findAll(query: ModuleCourseQueryDto): Promise<PaginatedResponseDto<any>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;

    const filters: string[] = ['mc.status <> -2']; // Exclude deleted items
    const params: any[] = [];

    if (query.module_id) {
      filters.push('mc.module_id = ?');
      params.push(query.module_id);
    }
    if (query.course_id) {
      filters.push('mc.course_id = ?');
      params.push(query.course_id);
    }
    if (query.status !== undefined) {
      filters.push('mc.status = ?');
      params.push(query.status);
    }

    const whereClause = `WHERE ${filters.join(' AND ')}`;

    const data = await this.dataSource.query(
      `SELECT mc.module_id, mc.course_id, mc.tri, mc.volume, mc.coefficient, mc.status, mc.created_at, mc.updated_at,
              m.id as moduleId, m.intitule as module_title,
              c.id as courseId, c.intitule as course_title
         FROM module_course mc
         LEFT JOIN modules m ON mc.module_id = m.id
         LEFT JOIN courses c ON mc.course_id = c.id
         ${whereClause}
         ORDER BY mc.course_id ASC, mc.tri ASC
         LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    const [{ total }] = await this.dataSource.query(
      `SELECT COUNT(*) as total FROM module_course mc ${whereClause}`,
      params,
    );

    return PaginationService.createResponse(
      data.map(this.mapRowToResponse),
      page,
      limit,
      Number(total) || 0,
    );
  }

  async findOne(moduleId: number, courseId: number) {
    const [row] = await this.dataSource.query(
      `SELECT mc.module_id, mc.course_id, mc.tri, mc.volume, mc.coefficient, mc.status, mc.created_at, mc.updated_at,
              m.id as moduleId, m.intitule as module_title,
              c.id as courseId, c.intitule as course_title
         FROM module_course mc
         LEFT JOIN modules m ON mc.module_id = m.id
         LEFT JOIN courses c ON mc.course_id = c.id
        WHERE mc.module_id = ? AND mc.course_id = ? AND mc.status <> -2`,
      [moduleId, courseId],
    );

    if (!row) {
      throw new NotFoundException('Module-course relation not found');
    }

    return this.mapRowToResponse(row);
  }

  async update(moduleId: number, courseId: number, dto: UpdateModuleCourseDto) {
    await this.ensureSchema();

    const existing = await this.findOne(moduleId, courseId);

    const tri = dto.tri ?? existing.tri;
    const volume = dto.volume !== undefined ? dto.volume : existing.volume;
    const coefficient = dto.coefficient !== undefined ? dto.coefficient : existing.coefficient;
    const status = dto.status !== undefined ? dto.status : existing.status;

    await this.dataSource.query(
      'UPDATE module_course SET tri = ?, volume = ?, coefficient = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE module_id = ? AND course_id = ?',
      [tri, volume, coefficient, status, moduleId, courseId],
    );

    return this.findOne(moduleId, courseId);
  }

  async remove(moduleId: number, courseId: number): Promise<void> {
    await this.ensureSchema();

    // Soft delete: set status to -2 (deleted)
    const result = await this.dataSource.query(
      'UPDATE module_course SET status = -2, updated_at = CURRENT_TIMESTAMP WHERE module_id = ? AND course_id = ? AND status <> -2',
      [moduleId, courseId],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException('Module-course relation not found');
    }
  }

  private async getNextTriForCourse(courseId: number): Promise<number> {
    const [row] = await this.dataSource.query(
      'SELECT COUNT(*) as total FROM module_course WHERE course_id = ? AND status <> -2',
      [courseId],
    );
    return Number(row?.total ?? 0);
  }

  private mapRowToResponse(row: any) {
    return {
      module_id: row.module_id,
      course_id: row.course_id,
      tri: Number(row.tri ?? 0),
      volume: row.volume !== null && row.volume !== undefined ? Number(row.volume) : null,
      coefficient: row.coefficient !== null && row.coefficient !== undefined ? Number(row.coefficient) : null,
      status: Number(row.status ?? 1),
      created_at: row.created_at,
      updated_at: row.updated_at,
      module: row.moduleId
        ? {
            id: row.moduleId,
            title: row.module_title,
          }
        : null,
      course: row.courseId
        ? {
            id: row.courseId,
            title: row.course_title,
          }
        : null,
    };
  }
}
