import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Teacher } from '../../teachers/entities/teacher.entity';
import { Specialization } from '../../specializations/entities/specialization.entity';
import { ClassEntity } from '../../class/entities/class.entity';
import { ClassRoom } from '../../class-rooms/entities/class-room.entity';
import { Company } from '../../company/entities/company.entity';
import { PlanningSessionType } from '../../planning-session-types/entities/planning-session-type.entity';
import { SchoolYear } from '../../school-years/entities/school-year.entity';

@Entity('planning_students')
export class StudentsPlanning {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  period: string;

  @Column()
  teacher_id: number;

  @ManyToOne(() => Teacher, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacher_id' })
  teacher: Teacher;

  @Column()
  specialization_id: number;

  @ManyToOne(() => Specialization, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'specialization_id' })
  specialization: Specialization;

  @Column()
  class_id: number;

  @ManyToOne(() => ClassEntity, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_id' })
  class: ClassEntity;

  @Column()
  class_room_id: number;

  @ManyToOne(() => ClassRoom, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'class_room_id' })
  classRoom: ClassRoom;

  @Column()
  planning_session_type_id: number;

  @ManyToOne(() => PlanningSessionType, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'planning_session_type_id' })
  planningSessionType: PlanningSessionType;

  @Column({ type: 'date' })
  date_day: string;

  @Column({ type: 'time' })
  hour_start: string;

  @Column({ type: 'time' })
  hour_end: string;

  @Column({ nullable: true })
  company_id?: number;

  @ManyToOne(() => Company, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company?: Company;

  @Column({ nullable: true })
  school_year_id?: number;

  @ManyToOne(() => SchoolYear, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_year_id' })
  schoolYear?: SchoolYear;

  @Column({ type: 'int', default: 2, name: 'statut' })
  status: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
