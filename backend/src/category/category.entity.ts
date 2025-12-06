import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Group } from '../group/group.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ default: '📦' })
  icon: string;

  @Column({ default: '#6366f1' })
  color: string;

  @Column({ default: false })
  isDefault: boolean;

  @ManyToOne(() => User, { eager: true, nullable: true })
  createdBy: User;

  @ManyToOne(() => Group, { eager: true, nullable: true })
  group: Group;

  @CreateDateColumn()
  createdAt: Date;
}
