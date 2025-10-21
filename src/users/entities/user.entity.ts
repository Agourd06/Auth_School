import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, ManyToOne, JoinColumn } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Company } from '../../company/entities/company.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'varchar', length: 20, default: 'user' })
  role: 'user' | 'admin';

  @Column({ nullable: true })
  company_id: number;

  @ManyToOne(() => Company, company => company.users, { nullable: true })
  @JoinColumn({ name: 'company_id' })
  company: Company;
  
  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }
}
