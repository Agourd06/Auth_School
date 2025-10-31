import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Student } from '../../students/entities/student.entity';

@Entity('student_diplomes')
export class StudentDiplome {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  school: string;

  @Column({ nullable: true })
  diplome: string;

  @Column({ type: 'int', nullable: true })
  annee: number;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  diplome_picture_1: string;

  @Column({ nullable: true })
  diplome_picture_2: string;

  @Column()
  student_id: number;

  @ManyToOne(() => Student)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
