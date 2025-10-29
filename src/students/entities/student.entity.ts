import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Company } from '../../company/entities/company.entity';
import { ClassRoom } from '../../class-rooms/entities/class-room.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string; // registration number

  @Column({ nullable: true })
  gender: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ type: 'date', nullable: true })
  birthday: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  country: string;

  @Column({ nullable: true })
  nationality: string;

  @Column({ nullable: true })
  picture: string;

  @Column({ nullable: true })
  company_id: number;

  @ManyToOne(() => Company, company => company.users, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @Column({ nullable: true })
  class_room_id: number;

  @ManyToOne(() => ClassRoom, { nullable: true })
  @JoinColumn({ name: 'class_room_id' })
  classRoom: ClassRoom;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
