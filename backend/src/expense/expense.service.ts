import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './expense.entity';
import { NotFoundException, ValidationException } from '../common/exceptions';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction } from '../activity/activity.entity';
import { GroupMemberService } from '../group-member/group-member.service';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    private activityService: ActivityService,
    private groupMemberService: GroupMemberService,
  ) {}

  // Create expense
  async create(data: CreateExpenseDto) {
    // Vérifier que l'utilisateur qui paie est membre du groupe
    const members = await this.groupMemberService.findMembersByGroup(data.groupId);
    const isPayer = members.some(member => member.userId === data.paidBy);
    
    if (!isPayer) {
      throw new ForbiddenException('Vous devez être membre du groupe pour créer une dépense');
    }

    // Vérifier que tous les participants sont membres du groupe
    const memberIds = members.map(m => m.userId);
    const invalidParticipants = data.participants.filter(id => !memberIds.includes(id));
    
    if (invalidParticipants.length > 0) {
      throw new ValidationException('Tous les participants doivent être membres du groupe');
    }

    const expenseData: any = {
      title: data.title,
      amount: data.amount,
      notes: data.description,
      date: data.date ? new Date(data.date) : new Date(),
      paidBy: { id: data.paidBy },
      group: { id: data.groupId },
      participants: data.participants.map(id => ({ id })),
      splitType: data.splitType || 'equal',
      splitDetails: data.splitDetails || null,
    };

    // Assigner une catégorie (fournie ou "Autre" par défaut)
    if (data.categoryId) {
      expenseData.category = { id: data.categoryId };
    } else {
      // Assigner la catégorie "Autre" par défaut (ID: 20)
      expenseData.category = { id: 20 };
    }

    const expense = this.expenseRepository.create(expenseData);
    const savedExpense = await this.expenseRepository.save(expense) as unknown as Expense;

    // Créer une activité
    try {
      await this.activityService.create({
        userId: data.paidBy,
        groupId: data.groupId,
        action: ActivityAction.EXPENSE_ADDED,
        entityType: 'expense',
        entityId: savedExpense.id,
        details: {
          title: data.title,
          amount: data.amount,
        },
      });
    } catch (error) {
      console.error('Erreur création activité:', error);
    }

    return savedExpense;
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
  async update(id: number, updateData: UpdateExpenseDto, userId?: number) {
    const expense = await this.findById(id);

    // Vérifier que l'utilisateur est membre du groupe
    if (userId) {
      const members = await this.groupMemberService.findMembersByGroup(expense.group.id);
      const isMember = members.some(member => member.userId === userId);
      
      if (!isMember) {
        throw new ForbiddenException('Vous devez être membre du groupe pour modifier cette dépense');
      }
    }

    if (updateData.amount !== undefined && updateData.amount <= 0) {
      throw new ValidationException('Montant invalide (doit être positif)');
    }
    
    // Vérifier que le nouveau payeur est membre du groupe (si changé)
    if (updateData.paidBy !== undefined) {
      const members = await this.groupMemberService.findMembersByGroup(expense.group.id);
      const isPayer = members.some(member => member.userId === updateData.paidBy);
      
      if (!isPayer) {
        throw new ValidationException('Le payeur doit être membre du groupe');
      }
    }
    
    // Vérifier que tous les nouveaux participants sont membres du groupe (si changés)
    if (updateData.participants !== undefined) {
      const members = await this.groupMemberService.findMembersByGroup(expense.group.id);
      const memberIds = members.map(m => m.userId);
      const invalidParticipants = updateData.participants.filter(id => !memberIds.includes(id));
      
      if (invalidParticipants.length > 0) {
        throw new ValidationException('Tous les participants doivent être membres du groupe');
      }
    }

    // Préparer les données de mise à jour
    const updatePayload: any = {};
    
    if (updateData.title !== undefined) updatePayload.title = updateData.title;
    if (updateData.amount !== undefined) updatePayload.amount = updateData.amount;
    if (updateData.description !== undefined) updatePayload.notes = updateData.description;
    if (updateData.date !== undefined) updatePayload.date = new Date(updateData.date);
    
    if (updateData.paidBy !== undefined) {
      updatePayload.paidBy = { id: updateData.paidBy };
    }
    
    if (updateData.categoryId !== undefined) {
      updatePayload.category = updateData.categoryId ? { id: updateData.categoryId } : null;
    }
    
    if (updateData.participants !== undefined) {
      updatePayload.participants = updateData.participants.map(id => ({ id }));
    }

    await this.expenseRepository.save({
      id,
      ...updatePayload,
    });
    
    const updatedExpense = await this.findById(id);

    // Créer une activité si userId fourni
    if (userId) {
      await this.activityService.create({
        userId,
        groupId: expense.group.id,
        action: ActivityAction.EXPENSE_UPDATED,
        entityType: 'expense',
        entityId: id,
        details: {
          title: updatedExpense.title,
        },
      });
    }

    return updatedExpense;
  }

  // Delete expense
  async delete(id: number, userId?: number) {
    const expense = await this.findById(id);
    
    // Vérifier que l'utilisateur est membre du groupe
    if (userId) {
      const members = await this.groupMemberService.findMembersByGroup(expense.group.id);
      const isMember = members.some(member => member.userId === userId);
      
      if (!isMember) {
        throw new ForbiddenException('Vous devez être membre du groupe pour supprimer cette dépense');
      }
    }
    
    // Créer une activité avant de supprimer
    if (userId) {
      await this.activityService.create({
        userId,
        groupId: expense.group.id,
        action: ActivityAction.EXPENSE_DELETED,
        entityType: 'expense',
        entityId: id,
        details: {
          title: expense.title,
          amount: expense.amount,
        },
      });
    }

    await this.expenseRepository.delete(id);
    return { message: 'Dépense supprimée avec succès' };
  }

  // Add attachments to expense
  async addAttachments(id: number, filenames: string[]) {
    const expense = await this.findById(id);
    const currentAttachments = expense.attachments || [];
    const updatedAttachments = [...currentAttachments, ...filenames];
    
    await this.expenseRepository.update(id, { attachments: updatedAttachments });
    
    return {
      message: 'Fichiers ajoutés avec succès',
      attachments: updatedAttachments,
    };
  }

  // Remove attachment from expense
  async removeAttachment(id: number, filename: string) {
    const expense = await this.findById(id);
    const currentAttachments = expense.attachments || [];
    const updatedAttachments = currentAttachments.filter(f => f !== filename);
    
    await this.expenseRepository.update(id, { attachments: updatedAttachments });
    
    // Delete file from disk
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'uploads', 'expenses', filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    return {
      message: 'Fichier supprimé avec succès',
      attachments: updatedAttachments,
    };
  }
}
