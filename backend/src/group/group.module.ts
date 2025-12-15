import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Group } from './group.entity';
import { GroupService } from './group.service';
import { GroupController } from './group.controller';
import { GroupMemberModule } from '../group-member/group-member.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group]),
    forwardRef(() => GroupMemberModule),
  ],
  providers: [GroupService],
  controllers: [GroupController],
  exports: [GroupService],
})
export class GroupModule {}
 