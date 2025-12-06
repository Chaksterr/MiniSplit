import { Entity, PrimaryGeneratedColumn, Column, OneToMany} from 'typeorm';
import { GroupMember } from '../group-member/group-member.entity';


@Entity()
export class Group {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column( {nullable: true })
  description: string;

  @OneToMany(() => GroupMember, (gm: GroupMember) => gm.group)
  memberships: GroupMember[];

}