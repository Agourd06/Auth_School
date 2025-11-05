import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { TeachersQueryDto } from './dto/teachers-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('Teachers')
@ApiBearerAuth()
@Controller('teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Teacher created successfully.' })
  @UseInterceptors(
    FileInterceptor('picture', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads', 'teachers');
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
  create(@UploadedFile() file, @Body() createTeacherDto: CreateTeacherDto) {
    if (file) {
      const relative = path.posix.join('uploads', 'teachers', path.basename(file.path));
      createTeacherDto.picture = `/${relative.replace(/\\/g, '/')}`;
    } else {
      const val: any = (createTeacherDto as any).picture;
      if (typeof val !== 'string' || val === '[object Object]' || val === 'null' || val === 'undefined') {
        delete (createTeacherDto as any).picture;
      }
    }
    return this.teachersService.create(createTeacherDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'Retrieve teachers with pagination metadata.' })
  findAll(@Query() query: TeachersQueryDto) {
    return this.teachersService.findAll(query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Retrieve a teacher by identifier.' })
  findOne(@Param('id') id: string) {
    return this.teachersService.findOne(+id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Update an existing teacher.' })
  @UseInterceptors(
    FileInterceptor('picture', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads', 'teachers');
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
    @UploadedFile() file,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    if (file) {
      const relative = path.posix.join('uploads', 'teachers', path.basename(file.path));
      updateTeacherDto.picture = `/${relative.replace(/\\/g, '/')}`;
    } else if ((updateTeacherDto as any).picture !== undefined) {
      const val: any = (updateTeacherDto as any).picture;
      if (typeof val !== 'string' || val === '[object Object]' || val === 'null' || val === 'undefined') {
        delete (updateTeacherDto as any).picture;
      }
    }
    return this.teachersService.update(+id, updateTeacherDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Remove a teacher record.' })
  remove(@Param('id') id: string) {
    return this.teachersService.remove(+id);
  }
}
