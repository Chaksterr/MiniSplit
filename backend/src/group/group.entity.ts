import { Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm';
import { GroupMember } from '../group-member/group-member.entity';
import { Expense } from '../expense/expense.entity';


@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column( {nullable: true })
  description: string;

  @OneToMany(() => GroupMember, (gm: GroupMember) => gm.group, { cascade: true, onDelete: 'CASCADE' })
  memberships: GroupMember[];

  @OneToMany(() => Expense, (expense: Expense) => expense.group)
  expenses: Expense[];

}