import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupMember } from './group-member.entity';
import { GroupMemberService } from './group-member.service';
import { GroupMemberController } from './group-member.controller';
import { ActivityModule } from '../activity/activity.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupMember]),
    ActivityModule,
  ], 
  providers: [GroupMemberService],                   
  controllers: [GroupMemberController],
  exports: [GroupMemberService],
})
export class GroupMemberModule {}
