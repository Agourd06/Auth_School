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

    const tri = dto.tri ?? (await this.getNextTriForCourse(dto.course_id));

    const result = await this.dataSource.query(
      'INSERT IGNORE INTO module_course (module_id, course_id, tri) VALUES (?, ?, ?)',
      [dto.module_id, dto.course_id, tri],
    );

    if (result.affectedRows === 0) {
      throw new BadRequestException('Module already linked to this course');
    }

    return this.findOne(dto.module_id, dto.course_id);
  }

  async findAll(query: ModuleCourseQueryDto): Promise<PaginatedResponseDto<any>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const offset = (page - 1) * limit;

    const filters: string[] = [];
    const params: any[] = [];

    if (query.module_id) {
      filters.push('mc.module_id = ?');
      params.push(query.module_id);
    }
    if (query.course_id) {
      filters.push('mc.course_id = ?');
      params.push(query.course_id);
    }

    const whereClause = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const data = await this.dataSource.query(
      `SELECT mc.module_id, mc.course_id, mc.tri, mc.created_at, mc.updated_at,
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
      `SELECT mc.module_id, mc.course_id, mc.tri, mc.created_at, mc.updated_at,
              m.id as moduleId, m.intitule as module_title,
              c.id as courseId, c.intitule as course_title
         FROM module_course mc
         LEFT JOIN modules m ON mc.module_id = m.id
         LEFT JOIN courses c ON mc.course_id = c.id
        WHERE mc.module_id = ? AND mc.course_id = ?`,
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

    await this.dataSource.query(
      'UPDATE module_course SET tri = ?, updated_at = CURRENT_TIMESTAMP WHERE module_id = ? AND course_id = ?',
      [tri, moduleId, courseId],
    );

    return this.findOne(moduleId, courseId);
  }

  async remove(moduleId: number, courseId: number): Promise<void> {
    await this.ensureSchema();

    const result = await this.dataSource.query(
      'DELETE FROM module_course WHERE module_id = ? AND course_id = ?',
      [moduleId, courseId],
    );

    if (result.affectedRows === 0) {
      throw new NotFoundException('Module-course relation not found');
    }
  }

  private async getNextTriForCourse(courseId: number): Promise<number> {
    const [row] = await this.dataSource.query(
      'SELECT COUNT(*) as total FROM module_course WHERE course_id = ?',
      [courseId],
    );
    return Number(row?.total ?? 0);
  }

  private mapRowToResponse(row: any) {
    return {
      module_id: row.module_id,
      course_id: row.course_id,
      tri: Number(row.tri ?? 0),
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

