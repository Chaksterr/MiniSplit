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
      return { groupId, totalSpent: 0, balances: [], settlementPlan: [] };
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
          user: {
            id: expense.paidBy.id,
            name: expense.paidBy.name,
            username: expense.paidBy.username,
            email: expense.paidBy.email,
            profilePhoto: expense.paidBy.avatar,
          },
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
            user: {
              id: participant.id,
              name: participant.name,
              username: participant.username,
              email: participant.email,
              profilePhoto: participant.avatar,
            },
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
        user: data.user,
        paid: parseFloat(data.paid.toFixed(3)),
        share: parseFloat(data.share.toFixed(3)),
        balance: parseFloat(balance.toFixed(3)),
      });
      totalSpent += data.paid;
    }

    // Calculate optimized settlement plan
    const settlementPlan = this.calculateSettlementPlan(balances);

    return {
      groupId,
      totalSpent: parseFloat(totalSpent.toFixed(3)),
      balances: balances.sort((a, b) => b.balance - a.balance),
      settlementPlan,
    };
  }

  // Calculate optimized settlement plan (minimize transactions)
  private calculateSettlementPlan(balances: any[]) {
    // Separate creditors (positive balance) and debtors (negative balance)
    const creditors = balances
      .filter(b => b.balance > 0.001)
      .map(b => ({ ...b }))
      .sort((a, b) => b.balance - a.balance);
    
    const debtors = balances
      .filter(b => b.balance < -0.001)
      .map(b => ({ ...b, balance: Math.abs(b.balance) }))
      .sort((a, b) => b.balance - a.balance);

    const transactions: any[] = [];

    // Greedy algorithm to minimize transactions
    let i = 0, j = 0;
    while (i < creditors.length && j < debtors.length) {
      const creditor = creditors[i];
      const debtor = debtors[j];

      const amount = Math.min(creditor.balance, debtor.balance);

      if (amount > 0.001) {
        transactions.push({
          from: debtor.user?.username || debtor.userName,
          fromId: debtor.userId,
          fromPhoto: debtor.user?.profilePhoto,
          to: creditor.user?.username || creditor.userName,
          toId: creditor.userId,
          toPhoto: creditor.user?.profilePhoto,
          amount: parseFloat(amount.toFixed(3)),
        });
      }

      creditor.balance -= amount;
      debtor.balance -= amount;

      if (creditor.balance < 0.001) i++;
      if (debtor.balance < 0.001) j++;
    }

    return transactions;
  }
}
