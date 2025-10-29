import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { SchoolYear } from 'src/school-years/entities/school-year.entity';

@Entity('school_year_periods')
export class SchoolYearPeriod {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'int', default: 2, name: 'statut' })
  status: number;

  @ManyToOne(() => SchoolYear, (schoolYear) => schoolYear.periods, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_year_id' })
  schoolYear: SchoolYear;
}
