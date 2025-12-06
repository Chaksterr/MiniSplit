import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from '../expense/expense.entity';

@Injectable()
export class BalanceService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  // Calculate balances for a group
  async calculateGroupBalances(groupId: number) {
    const expenses = await this.expenseRepository.find({
      where: { group: { id: groupId } },
      relations: ['paidBy', 'group', 'participants'],
      order: { date: 'DESC' },
    });

    if (expenses.length === 0) {
      return { groupId, totalSpent: 0, balances: [] };
    }

    // Track each user's paid and share amounts
    const userBalances = new Map<number, any>();

    for (const expense of expenses) {
      const amount = parseFloat(expense.amount.toString());
      const sharePerPerson = amount / expense.participants.length;

      // Initialize payer
      if (!userBalances.has(expense.paidBy.id)) {
        userBalances.set(expense.paidBy.id, {
          userId: expense.paidBy.id,
          userName: expense.paidBy.name,
          paid: 0,
          share: 0,
        });
      }

      // Add paid amount
      userBalances.get(expense.paidBy.id).paid += amount;

      // Add share for each participant
      for (const participant of expense.participants) {
        if (!userBalances.has(participant.id)) {
          userBalances.set(participant.id, {
            userId: participant.id,
            userName: participant.name,
            paid: 0,
            share: 0,
          });
        }
        userBalances.get(participant.id).share += sharePerPerson;
      }
    }

    // Calculate final balances
    const balances: any[] = [];
    let totalSpent = 0;

    for (const [userId, data] of userBalances) {
      const balance = data.paid - data.share;
      balances.push({
        userId: data.userId,
        userName: data.userName,
        paid: parseFloat(data.paid.toFixed(3)),
        share: parseFloat(data.share.toFixed(3)),
        balance: parseFloat(balance.toFixed(3)),
      });
      totalSpent += data.paid;
    }

    return {
      groupId,
      totalSpent: parseFloat(totalSpent.toFixed(3)),
      balances: balances.sort((a, b) => b.balance - a.balance),
    };
  }
}
