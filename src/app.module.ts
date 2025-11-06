import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { UsersModule } from './users/users.module';
import { ModuleModule } from './module/module.module';
import { CourseModule } from './course/course.module';
import { SchoolYearsModule } from './school-years/school-years.module';
import { SchoolYearPeriodsModule } from './school-year-periods/school-year-periods.module';
import { ClassRoomsModule } from './class-rooms/class-rooms.module';
import { StudentsModule } from './students/students.module';
import { TeachersModule } from './teachers/teachers.module';
import { AdministratorsModule } from './administrators/administrators.module';
import { StudentDiplomeModule } from './student-diplome/student-diplome.module';
import { StudentContactModule } from './student-contact/student-contact.module';
import { StudentlinktypeModule } from './studentlinktype/studentlinktype.module';
import { ProgramModule } from './programs/programs.module';
import { LevelModule } from './level/level.module';
import { SpecializationsModule } from './specializations/specializations.module';
import { ClassModule } from './class/class.module';
import { ClassStudentModule } from './class-student/class-student.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      username: process.env.DB_USERNAME || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'edusol_25',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production', // for dev only
    }),
    AuthModule,
    CompanyModule,
    UsersModule,
    ModuleModule,
    CourseModule,
    SchoolYearsModule,
    SchoolYearPeriodsModule,
    ClassRoomsModule,
    StudentsModule,
    TeachersModule,
    AdministratorsModule,
    StudentDiplomeModule,
    StudentContactModule,
    StudentlinktypeModule,
    ProgramModule,
    LevelModule,
    SpecializationsModule,
    ClassModule,
    ClassStudentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
