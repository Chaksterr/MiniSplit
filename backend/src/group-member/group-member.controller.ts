import { Controller, Post, Delete, Get, Body, Param } from '@nestjs/common';
import { GroupMemberService } from './group-member.service';
import { AddMemberDto } from './dto/add-member.dto';

@Controller('group-members')
export class GroupMemberController {
  constructor(private readonly gmService: GroupMemberService) {}

  @Post()
  add(@Body() data: AddMemberDto) {
    return this.gmService.addMember(data);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.gmService.removeMember(id);
  }

  @Get('group/:groupId')
  getByGroup(@Param('groupId') groupId: number) {
    return this.gmService.findMembersByGroup(groupId);
  }

  @Get('user/:userId')
  getByUser(@Param('userId') userId: number) {
    return this.gmService.findGroupsByUser(userId);
  }

  @Post(':id/promote')
  promoteToAdmin(@Param('id') id: number) {
    return this.gmService.promoteToAdmin(id);
  }
}
