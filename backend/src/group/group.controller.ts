import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Controller('groups')
export class GroupController {
    constructor(private readonly groupService: GroupService) {}


    @Post()
    create(@Body() groupData: CreateGroupDto) {
        return this.groupService.create(groupData);
    }
    @Get()
    findAll() {
        return this.groupService.findAll();
    }
    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.groupService.findById(id);
    }
    
    @Get('name/:name')
    findByName(@Param('name') name: string) {
        return this.groupService.findByName(name);
    }
    @Put(':id')
    update(@Param('id') id: number, @Body() updateData: UpdateGroupDto) {
        return this.groupService.update(id, updateData);
    }
    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.groupService.delete(id);
    }
}
    
