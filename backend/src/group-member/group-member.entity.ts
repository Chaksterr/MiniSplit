import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from '../user/user.entity';
import { Group } from '../group/group.entity';

@Entity()
export class GroupMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @Column()
  groupId: number;

  @ManyToOne(() => User, (user) => user.groupMemberships)
  user: User;

  @ManyToOne(() => Group, (group) => group.memberships, { onDelete: 'CASCADE' })
  group: Group;

  @Column({ default: 'member' })
  role: string;
  
  @Column({ default: false })
  isAdmin: boolean;
}
