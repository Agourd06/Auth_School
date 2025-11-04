import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Company } from '../../company/entities/company.entity';
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

  @Column({ nullable: true })
  company_id: number;

  @ManyToOne(() => Company, company => company.schoolYears, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => SchoolYear, (schoolYear) => schoolYear.periods, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_year_id' })
  schoolYear: SchoolYear;
}
