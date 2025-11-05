import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { StudentDiplomeService } from './student-diplome.service';
import { CreateStudentDiplomeDto } from './dto/create-student-diplome.dto';
import { UpdateStudentDiplomeDto } from './dto/update-student-diplome.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { StudentDiplomesQueryDto } from './dto/student-diplomes-query.dto';

@ApiTags('Student Diplomas')
@ApiBearerAuth()
@Controller('student-diplome')
export class StudentDiplomeController {
  constructor(private readonly studentDiplomeService: StudentDiplomeService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Student diploma record created successfully.' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'diplome_picture_1', maxCount: 1 },
      { name: 'diplome_picture_2', maxCount: 1 },
    ], {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads', 'student-diplomes');
          if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const sanitized = file.originalname.replace(/\s+/g, '_');
          cb(null, `${timestamp}_${sanitized}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowed.includes(file.mimetype)) return cb(null, true);
        return cb(null, false);
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  create(@UploadedFiles() files: { diplome_picture_1?: Express.Multer.File[]; diplome_picture_2?: Express.Multer.File[]; }, @Body() dto: CreateStudentDiplomeDto) {
    const f1 = files?.diplome_picture_1?.[0];
    const f2 = files?.diplome_picture_2?.[0];
    if (f1) {
      const relative = path.posix.join('uploads', 'student-diplomes', path.basename(f1.path));
      (dto as any).diplome_picture_1 = `/${relative.replace(/\\/g, '/')}`;
    }
    if (f2) {
      const relative = path.posix.join('uploads', 'student-diplomes', path.basename(f2.path));
      (dto as any).diplome_picture_2 = `/${relative.replace(/\\/g, '/')}`;
    }
    // sanitize text values possibly coming as [object Object]
    ['diplome_picture_1','diplome_picture_2'].forEach(k => {
      const v: any = (dto as any)[k];
      if (v !== undefined && (typeof v !== 'string' || v === '[object Object]' || v === 'null' || v === 'undefined')) {
        delete (dto as any)[k];
      }
    });
    return this.studentDiplomeService.create(dto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Retrieve student diplomas with pagination metadata.' })
  findAll(@Query() query: StudentDiplomesQueryDto) {
    return this.studentDiplomeService.findAll(query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Retrieve a student diploma by identifier.' })
  findOne(@Param('id') id: string) {
    return this.studentDiplomeService.findOne(+id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Update a student diploma record.' })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'diplome_picture_1', maxCount: 1 },
      { name: 'diplome_picture_2', maxCount: 1 },
    ], {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads', 'student-diplomes');
          if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const sanitized = file.originalname.replace(/\s+/g, '_');
          cb(null, `${timestamp}_${sanitized}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowed.includes(file.mimetype)) return cb(null, true);
        return cb(null, false);
      },
      limits: { fileSize: 2 * 1024 * 1024 },
    }),
  )
  update(
    @Param('id') id: string,
    @UploadedFiles() files: { diplome_picture_1?: Express.Multer.File[]; diplome_picture_2?: Express.Multer.File[]; },
    @Body() dto: UpdateStudentDiplomeDto,
  ) {
    const f1 = files?.diplome_picture_1?.[0];
    const f2 = files?.diplome_picture_2?.[0];
    if (f1) {
      const relative = path.posix.join('uploads', 'student-diplomes', path.basename(f1.path));
      (dto as any).diplome_picture_1 = `/${relative.replace(/\\/g, '/')}`;
    }
    if (f2) {
      const relative = path.posix.join('uploads', 'student-diplomes', path.basename(f2.path));
      (dto as any).diplome_picture_2 = `/${relative.replace(/\\/g, '/')}`;
    }
    ['diplome_picture_1','diplome_picture_2'].forEach(k => {
      const v: any = (dto as any)[k];
      if (v !== undefined && (typeof v !== 'string' || v === '[object Object]' || v === 'null' || v === 'undefined')) {
        delete (dto as any)[k];
      }
    });
    return this.studentDiplomeService.update(+id, dto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Remove a student diploma record.' })
  remove(@Param('id') id: string) {
    return this.studentDiplomeService.remove(+id);
  }
}
