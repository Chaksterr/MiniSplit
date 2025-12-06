import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { SettlementService } from './settlement.service';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { UpdateSettlementDto } from './dto/update-settlement.dto';

@Controller('settlements')
export class SettlementController {
  constructor(private readonly settlementService: SettlementService) {}

  @Post()
  create(@Body() createSettlementDto: CreateSettlementDto) {
    return this.settlementService.create(createSettlementDto);
  }

  @Get()
  findAll() {
    return this.settlementService.findAll();
  }

  @Get('group/:groupId')
  findByGroup(@Param('groupId') groupId: number) {
    return this.settlementService.findByGroup(groupId);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: number) {
    return this.settlementService.findByUser(userId);
  }

  @Get(':id')
  findById(@Param('id') id: number) {
    return this.settlementService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateSettlementDto: UpdateSettlementDto) {
    return this.settlementService.update(id, updateSettlementDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.settlementService.delete(id);
  }
}
