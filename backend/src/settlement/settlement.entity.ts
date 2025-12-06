import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../user/user.entity';
import { Group } from '../group/group.entity';

export enum SettlementStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity()
export class Settlement {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  fromUser: User;

  @ManyToOne(() => User, { eager: true })
  toUser: User;

  @Column('decimal', { precision: 10, scale: 3 })
  amount: number;

  @ManyToOne(() => Group, { eager: true })
  group: Group;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column({
    type: 'enum',
    enum: SettlementStatus,
    default: SettlementStatus.COMPLETED,
  })
  status: SettlementStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ nullable: true })
  proofImage: string;

  @CreateDateColumn()
  createdAt: Date;
}
