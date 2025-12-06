import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, ManyToMany, JoinTable, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Group } from '../group/group.entity';
import { Category } from '../category/category.entity';

@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('decimal', { precision: 10, scale: 3 })
  amount: number; 

  @Column({ default: 'TND' })
  currency: string; 
  @ManyToOne(() => User, { eager: true })
  paidBy: User;

  @ManyToOne(() => Group, { eager: true })
  group: Group;

  @ManyToOne(() => Category, { eager: true, nullable: true })
  category: Category; 

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @ManyToMany(() => User, { eager: true })
  @JoinTable({
    name: 'expense_participants',
    joinColumn: { name: 'expense_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' }
  })
  participants: User[];

  @Column({ default: 'equal' })
  splitType: string; 

  @Column('jsonb', { nullable: true })
  splitDetails: any; 

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
