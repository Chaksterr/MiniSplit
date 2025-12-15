import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Category } from './category.entity';

@Entity()
export class UserCategoryBudget {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Category, { eager: true })
  category: Category;

  @Column()
  categoryId: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  budgetLimit: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
