import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ActivityService } from './activity.service';
import { CreateActivityDto } from './dto/create-activity.dto';

@Controller('activities')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  @Post()
  create(@Body() createActivityDto: CreateActivityDto) {
    return this.activityService.create(createActivityDto);
  }

  @Get()
  findAll() {
    return this.activityService.findAll();
  }

  @Get('group/:groupId')
  findByGroup(@Param('groupId') groupId: number) {
    return this.activityService.findByGroup(groupId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: number) {
    return this.activityService.findByUser(userId);
  }
}
