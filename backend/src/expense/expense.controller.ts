import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  create(@Body() expenseData: CreateExpenseDto) {
    return this.expenseService.create(expenseData);
  }

  @Get()
  findAll() {
    return this.expenseService.findAll();
  }

  @Get('group/:groupId')
  findByGroup(@Param('groupId') groupId: number) {
    return this.expenseService.findByGroup(groupId);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.expenseService.findById(id);
  }

  @Put(':id')
  update(@Param('id') id: number, @Body() updateData: UpdateExpenseDto) {
    return this.expenseService.update(id, updateData);
  }

  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.expenseService.delete(id);
  }
}
