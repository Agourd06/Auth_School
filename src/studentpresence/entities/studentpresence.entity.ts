import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StudentsPlanning } from '../../students-plannings/entities/students-planning.entity';
import { Student } from '../../students/entities/student.entity';
import { Company } from '../../company/entities/company.entity';

@Entity('student_presence')
export class StudentPresence {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  student_planning_id: number;

  @ManyToOne(() => StudentsPlanning, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_planning_id' })
  studentPlanning: StudentsPlanning;

  @Column()
  student_id: number;

  @ManyToOne(() => Student, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ length: 25, default: 'absent' })
  presence: string;

  @Column({ type: 'double', default: -1 })
  note: number;

  @Column({ type: 'longtext', nullable: true })
  remarks?: string;

  @Column({ nullable: true })
  company_id?: number;

  @ManyToOne(() => Company, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ length: 50, default: 'active' })
  status: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
