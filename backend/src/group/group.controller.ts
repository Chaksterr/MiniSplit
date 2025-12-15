import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { GroupService } from './group.service';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupController {
    constructor(private readonly groupService: GroupService) {}


    @Post()
    create(@Body() groupData: CreateGroupDto, @CurrentUser() user: any) {
        return this.groupService.create(groupData, user.id);
    }
    
    @Get()
    findAll(@CurrentUser() user: any, @Query('category') category?: string) {
        // Retourner uniquement les groupes dont l'utilisateur est membre
        return this.groupService.findUserGroups(user.id);
    }
    
    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.groupService.findById(id);
    }
    
    @Get('name/:name')
    findByName(@Param('name') name: string) {
        return this.groupService.findByName(name);
    }

    @Get('code/:code')
    findByCode(@Param('code') code: string) {
        return this.groupService.findByCode(code);
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
    
