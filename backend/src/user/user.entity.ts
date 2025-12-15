import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, OneToMany} from 'typeorm';
import { Exclude } from 'class-transformer';
import * as bcrypt from 'bcrypt';
import { GroupMember } from '../group-member/group-member.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ nullable: true })
  avatar: string;

  @OneToMany(() => GroupMember, (gm: GroupMember) => gm.user)
  groupMemberships: GroupMember[];
  
  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
  

}
