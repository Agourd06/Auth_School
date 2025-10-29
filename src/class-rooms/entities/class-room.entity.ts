import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Company } from '../../company/entities/company.entity';

@Entity('class_rooms')
export class ClassRoom {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  title: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ nullable: true })
  company_id: number;

  @ManyToOne(() => Company, company => company.modules, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
