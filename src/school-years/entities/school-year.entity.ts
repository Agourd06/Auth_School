import { Company } from 'src/company/entities/company.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { SchoolYearPeriod } from 'src/school-year-periods/entities/school-year-period.entity';

@Entity('school_years')
export class SchoolYear {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'int', default: 2 , name: 'statut' })
  status: number;

  @ManyToOne(() => Company, (company) => company.schoolYears, { eager: true })
  company: Company;

  @OneToMany(() => SchoolYearPeriod, (period) => period.schoolYear, { cascade: true })
  periods: SchoolYearPeriod[];
}
