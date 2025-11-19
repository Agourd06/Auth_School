import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { StudentReport } from '../../student-report/entities/student-report.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Course } from '../../course/entities/course.entity';

@Entity('student_report_details')
export class StudentReportDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  student_report_id: number;

  @ManyToOne(() => StudentReport, report => report.details, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_report_id' })
  studentReport: StudentReport;

  @Column()
  teacher_id: number;

  @ManyToOne(() => Teacher, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @Column()
  course_id: number;

  @ManyToOne(() => Course, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @Column({ type: 'longtext', nullable: true })
  remarks?: string;

  @Column({ type: 'longtext', nullable: true })
  note?: string;

  @Column({ type: 'int', default: 2, name: 'statut' })
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
