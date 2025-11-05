import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AdministratorsService } from './administrators.service';
import { CreateAdministratorDto } from './dto/create-administrator.dto';
import { UpdateAdministratorDto } from './dto/update-administrator.dto';
import { AdministratorsQueryDto } from './dto/administrators-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('Administrators')
@ApiBearerAuth()
@Controller('administrators')
export class AdministratorsController {
  constructor(private readonly administratorsService: AdministratorsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Administrator created successfully.' })
  @UseInterceptors(
    FileInterceptor('picture', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads', 'administrators');
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
  create(@UploadedFile() file, @Body() createAdministratorDto: CreateAdministratorDto) {
    if (file) {
      const relative = path.posix.join('uploads', 'administrators', path.basename(file.path));
      createAdministratorDto.picture = `/${relative.replace(/\\/g, '/')}`;
    } else {
      const val: any = (createAdministratorDto as any).picture;
      if (typeof val !== 'string' || val === '[object Object]' || val === 'null' || val === 'undefined') {
        delete (createAdministratorDto as any).picture;
      }
    }
    return this.administratorsService.create(createAdministratorDto);
  }

  @Get()
  @ApiResponse({ status: 200, description: 'List administrators based on the provided filters.' })
  findAll(@Query() query: AdministratorsQueryDto) {
    return this.administratorsService.findAll(query);
  }

  @Get(':id')
  @ApiResponse({ status: 200, description: 'Retrieve a single administrator.' })
  findOne(@Param('id') id: string) {
    return this.administratorsService.findOne(+id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Update administrator details.' })
  @UseInterceptors(
    FileInterceptor('picture', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = path.join(process.cwd(), 'uploads', 'administrators');
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
    @Body() updateAdministratorDto: UpdateAdministratorDto,
  ) {
    if (file) {
      const relative = path.posix.join('uploads', 'administrators', path.basename(file.path));
      updateAdministratorDto.picture = `/${relative.replace(/\\/g, '/')}`;
    } else if ((updateAdministratorDto as any).picture !== undefined) {
      const val: any = (updateAdministratorDto as any).picture;
      if (typeof val !== 'string' || val === '[object Object]' || val === 'null' || val === 'undefined') {
        delete (updateAdministratorDto as any).picture;
      }
    }
    return this.administratorsService.update(+id, updateAdministratorDto);
  }

  @Delete(':id')
  @ApiResponse({ status: 200, description: 'Remove an administrator record.' })
  remove(@Param('id') id: string) {
    return this.administratorsService.remove(+id);
  }
}
