import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './expense.entity';
import { NotFoundException, ValidationException } from '../common/exceptions';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  // Create expense
  async create(data: CreateExpenseDto) {
    const expenseData: any = {
      title: data.title,
      amount: data.amount,
      notes: data.description,
      date: data.date ? new Date(data.date) : new Date(),
      paidBy: { id: data.paidBy },
      group: { id: data.groupId },
      participants: data.participants.map(id => ({ id })),
    };

    if (data.categoryId) {
      expenseData.category = { id: data.categoryId };
    }

    const expense = this.expenseRepository.create(expenseData);
    return await this.expenseRepository.save(expense);
  }

  // Get all expenses
  async findAll() {
    return this.expenseRepository.find({
      relations: ['paidBy', 'group', 'participants'],
    });
  }

  // Get expense by id
  async findById(id: number) {
    const expense = await this.expenseRepository.findOne({
      where: { id },
      relations: ['paidBy', 'group', 'participants'],
    });

    if (!expense) {
      throw new NotFoundException('Dépense', id);
    }

    return expense;
  }

  // Get all expenses in a group
  async findByGroup(groupId: number) {
    return this.expenseRepository.find({
      where: { group: { id: groupId } },
      relations: ['paidBy', 'group', 'participants'],
      order: { date: 'DESC' },
    });
  }

  // Update expense
  async update(id: number, updateData: UpdateExpenseDto) {
    const expense = await this.findById(id);

    if (updateData.amount !== undefined && updateData.amount <= 0) {
      throw new ValidationException('Montant invalide (doit être positif)');
    }

    await this.expenseRepository.update(id, updateData);
    return this.findById(id);
  }

  // Delete expense
  async delete(id: number) {
    const expense = await this.findById(id);
    await this.expenseRepository.delete(id);
    return { message: 'Dépense supprimée avec succès' };
  }
}
