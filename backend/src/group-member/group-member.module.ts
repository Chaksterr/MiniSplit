import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupMember } from './group-member.entity';
import { GroupMemberService } from './group-member.service';
import { GroupMemberController } from './group-member.controller';

@Module({
  imports: [TypeOrmModule.forFeature([GroupMember])], 
  providers: [GroupMemberService],                   
  controllers: [GroupMemberController],             
})
export class GroupMemberModule {}
