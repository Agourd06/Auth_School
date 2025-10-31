import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsQueryDto } from './dto/students-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('picture', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads', 'students');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
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
      limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
    }),
  )
  create(@UploadedFile() file: Express.Multer.File, @Body() createStudentDto: CreateStudentDto) {
    if (file) {
      const relative = path.posix.join('uploads', 'students', path.basename(file.path));
      createStudentDto.picture = `/${relative.replace(/\\/g, '/')}`;
    } else {
      const val: any = (createStudentDto as any).picture;
      if (typeof val !== 'string' || val === '[object Object]' || val === 'null' || val === 'undefined') {
        delete (createStudentDto as any).picture;
      }
    }
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  findAll(@Query() query: StudentsQueryDto) {
    return this.studentsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(+id);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('picture', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads', 'students');
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
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
    @UploadedFile() file: Express.Multer.File,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    if (file) {
      const relative = path.posix.join('uploads', 'students', path.basename(file.path));
      updateStudentDto.picture = `/${relative.replace(/\\/g, '/')}`;
    } else if ((updateStudentDto as any).picture !== undefined) {
      const val: any = (updateStudentDto as any).picture;
      if (typeof val !== 'string' || val === '[object Object]' || val === 'null' || val === 'undefined') {
        delete (updateStudentDto as any).picture;
      }
    }
    return this.studentsService.update(+id, updateStudentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(+id);
  }
}
