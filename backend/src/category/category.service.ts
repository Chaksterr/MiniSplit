import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { UserCategoryBudget } from './user-category-budget.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { NotFoundException, ValidationException } from '../common/exceptions';
import { DEFAULT_CATEGORIES } from './category.seed';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(UserCategoryBudget)
    private userCategoryBudgetRepository: Repository<UserCategoryBudget>,
  ) {
    this.initializeDefaultCategories();
  }

  private async initializeDefaultCategories() {
    // Vérifier si les catégories par défaut existent
    const count = await this.categoryRepository.count({ where: { isDefault: true } });
    
    if (count === 0) {
      console.log('Initializing default categories...');
      for (const categoryData of DEFAULT_CATEGORIES) {
        const category = this.categoryRepository.create(categoryData);
        await this.categoryRepository.save(category);
      }
      console.log('Default categories initialized successfully');
    } else if (count < DEFAULT_CATEGORIES.length) {
      // Ajouter les catégories manquantes
      console.log('Checking for missing default categories...');
      for (const categoryData of DEFAULT_CATEGORIES) {
        const exists = await this.categoryRepository.findOne({
          where: { name: categoryData.name, isDefault: true }
        });
        if (!exists) {
          console.log(`Adding missing category: ${categoryData.name}`);
          const category = this.categoryRepository.create(categoryData);
          await this.categoryRepository.save(category);
        }
      }
      console.log('Missing categories added successfully');
    }

    // Migrer les dépenses avec catégories personnalisées vers "Autre"
    try {
      const customCategories = await this.categoryRepository.find({ where: { isDefault: false } });
      if (customCategories.length > 0) {
        console.log(`Found ${customCategories.length} custom categories to migrate...`);
        
        // Trouver la catégorie "Autre"
        const otherCategory = await this.categoryRepository.findOne({
          where: { name: 'Autre', isDefault: true }
        });

        if (otherCategory) {
          // Mettre à jour toutes les dépenses qui utilisent des catégories personnalisées
          for (const customCat of customCategories) {
            await this.categoryRepository.manager.query(
              'UPDATE expense SET "categoryId" = $1 WHERE "categoryId" = $2',
              [otherCategory.id, customCat.id]
            );
          }
          
          // Maintenant supprimer les catégories personnalisées
          await this.categoryRepository.remove(customCategories);
          console.log('Custom categories migrated and deleted successfully');
        }
      }
    } catch (error) {
      console.error('Error migrating custom categories:', error.message);
    }
  }

  async create(data: CreateCategoryDto) {
    // Empêcher la création de catégories personnalisées
    if (!data.isDefault) {
      throw new ValidationException('La création de catégories personnalisées n\'est pas autorisée. Utilisez les catégories par défaut.');
    }

    const categoryData: any = {
      name: data.name,
      icon: data.icon || '📦',
      color: data.color || '#6366f1',
      isDefault: data.isDefault || false,
    };

    if (data.createdBy) {
      categoryData.createdBy = { id: data.createdBy };
    }

    if (data.groupId) {
      categoryData.group = { id: data.groupId };
    }

    const category = this.categoryRepository.create(categoryData);
    return await this.categoryRepository.save(category);
  }

  async findAll() {
    return this.categoryRepository.find({
      order: { isDefault: 'DESC', name: 'ASC' },
    });
  }

  async findByGroup(groupId: number) {
    return this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.createdBy', 'createdBy')
      .leftJoinAndSelect('category.group', 'group')
      .where('category.groupId = :groupId', { groupId })
      .orWhere('category.groupId IS NULL AND category.isDefault = true')
      .orderBy('category.isDefault', 'DESC')
      .addOrderBy('category.name', 'ASC')
      .getMany();
  }

  async findById(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException('Catégorie', id);
    }
    return category;
  }

  async update(id: number, data: UpdateCategoryDto) {
    const category = await this.findById(id);
    
    // Pour les catégories par défaut, empêcher toute modification
    if (category.isDefault) {
      throw new ValidationException('Les catégories par défaut ne peuvent pas être modifiées. Utilisez les endpoints de budget personnel pour définir votre limite budgétaire.');
    }

    // Pour les catégories personnalisées, mettre à jour tous les champs
    if (data.name !== undefined) category.name = data.name;
    if (data.icon !== undefined) category.icon = data.icon;
    if (data.color !== undefined) category.color = data.color;
    if (data.isDefault !== undefined) category.isDefault = data.isDefault;

    await this.categoryRepository.save(category);
    return category;
  }

  async delete(id: number) {
    const category = await this.findById(id);
    
    if (category.isDefault) {
      throw new ValidationException('Impossible de supprimer une catégorie par défaut');
    }

    await this.categoryRepository.delete(id);
    return { message: 'Catégorie supprimée avec succès' };
  }

  // ========================================
  // GESTION DES BUDGETS PERSONNELS
  // ========================================

  /**
   * Définir ou mettre à jour le budget personnel d'un utilisateur pour une catégorie
   */
  async setUserBudget(userId: number, categoryId: number, budgetLimit: number) {
    // Vérifier que la catégorie existe
    const category = await this.findById(categoryId);

    // Chercher si un budget existe déjà
    let userBudget = await this.userCategoryBudgetRepository.findOne({
      where: { userId, categoryId }
    });

    if (userBudget) {
      // Mettre à jour le budget existant
      userBudget.budgetLimit = budgetLimit;
    } else {
      // Créer un nouveau budget
      userBudget = this.userCategoryBudgetRepository.create({
        userId,
        categoryId,
        budgetLimit,
      });
    }

    return await this.userCategoryBudgetRepository.save(userBudget);
  }

  /**
   * Récupérer le budget personnel d'un utilisateur pour une catégorie
   */
  async getUserBudget(userId: number, categoryId: number) {
    return await this.userCategoryBudgetRepository.findOne({
      where: { userId, categoryId }
    });
  }

  /**
   * Récupérer tous les budgets personnels d'un utilisateur
   */
  async getUserBudgets(userId: number) {
    return await this.userCategoryBudgetRepository.find({
      where: { userId }
    });
  }

  /**
   * Supprimer le budget personnel d'un utilisateur pour une catégorie
   */
  async deleteUserBudget(userId: number, categoryId: number) {
    const userBudget = await this.userCategoryBudgetRepository.findOne({
      where: { userId, categoryId }
    });

    if (!userBudget) {
      throw new NotFoundException('Budget personnel', `userId: ${userId}, categoryId: ${categoryId}`);
    }

    await this.userCategoryBudgetRepository.remove(userBudget);
    return { message: 'Budget personnel supprimé avec succès' };
  }

  /**
   * Récupérer toutes les catégories avec les budgets personnels de l'utilisateur
   */
  async findAllWithUserBudgets(userId?: number) {
    const categories = await this.findAll();
    
    // Si pas d'utilisateur, retourner les catégories sans budgets
    if (!userId) {
      return categories.map(category => ({
        ...category,
        userBudgetLimit: null,
      }));
    }

    const userBudgets = await this.getUserBudgets(userId);

    // Créer un map des budgets par categoryId
    const budgetMap = new Map();
    userBudgets.forEach(budget => {
      budgetMap.set(budget.categoryId, budget.budgetLimit);
    });

    // Ajouter les budgets personnels aux catégories
    return categories.map(category => ({
      ...category,
      userBudgetLimit: budgetMap.get(category.id) || null,
    }));
  }
}
