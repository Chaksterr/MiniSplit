import { Injectable } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { NotFoundException, ValidationException, DuplicateException } from '../common/exceptions';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GroupMember } from '../group-member/group-member.entity';
import { Expense } from '../expense/expense.entity';
import { Settlement } from '../settlement/settlement.entity';
import { Activity } from '../activity/activity.entity';
import { UserCategoryBudget } from '../category/user-category-budget.entity';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userReposistory: Repository<User>,
    @InjectRepository(GroupMember)
    private groupMemberRepository: Repository<GroupMember>,
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    @InjectRepository(Settlement)
    private settlementRepository: Repository<Settlement>,
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
    @InjectRepository(UserCategoryBudget)
    private userCategoryBudgetRepository: Repository<UserCategoryBudget>,
  ) {}

  //Create user
  async create(userData: CreateUserDto){
    // Validate required fields
    if (!userData.name || !userData.email || !userData.password) {
      throw new ValidationException(
        'Nom, email et mot de passe requis'
      );
    }

    // Validate username if provided
    if (userData['username']) {
      const existingUsername = await this.userReposistory.findOne({
        where: { username: userData['username'] }
      });

      if (existingUsername) {
        throw new DuplicateException('Utilisateur', 'username', userData['username']);
      }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new ValidationException(
        "Email invalide"
      );
    }

    // Check if email already exists
    const existingUser = await this.userReposistory.findOne({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new DuplicateException('Utilisateur', 'email', userData.email);
    }

    // Validate password length
    if (userData.password.length < 6) {
      throw new ValidationException(
        'Mot de passe trop court (minimum 6 caractères)'
      );
    }

    try {
      const user = this.userReposistory.create(userData);
      return await this.userReposistory.save(user);
    } catch (error) {
      throw new ValidationException(
        "Impossible de créer l'utilisateur"
      );
    }
  }

  //Get all users
   async findAll(){
    return this.userReposistory.find();
  }

  //Get user by id
  async findById(id: number){
    if (!id || id <= 0) {
      throw new ValidationException(
        "ID invalide"
      );
    }

    const user = await this.userReposistory.findOneBy({id});
    
    if (!user) {
      throw new NotFoundException('Utilisateur', id);
    }

    return user;
  }

  //Get user by name
  async findByName(name: string){
    if (!name || name.trim().length === 0) {
      throw new ValidationException(
        'Nom requis'
      );
    }

    const user = await this.userReposistory.findOneBy({name});
    
    if (!user) {
      throw new NotFoundException('Utilisateur', name);
    }

    return user;
  }

  //Get user by email (pour JWT authentication)
  async findByEmail(email: string): Promise<User | null> {
    if (!email || email.trim().length === 0) {
      return null;
    }

    return this.userReposistory.findOne({
      where: { email }
    });
  }

  //Get user by username
  async findByUsername(username: string): Promise<User | null> {
    if (!username || username.trim().length === 0) {
      throw new ValidationException('Nom d\'utilisateur requis');
    }

    const user = await this.userReposistory.findOne({
      where: { username }
    });

    if (!user) {
      throw new NotFoundException('Utilisateur', username);
    }

    return user;
  }

  //Get user by username for authentication (ne lance pas d'exception si non trouvé)
  async findByUsernameForAuth(username: string): Promise<User | null> {
    if (!username || username.trim().length === 0) {
      return null;
    }

    return this.userReposistory.findOne({
      where: { username }
    });
  }

  //Find one user (alias pour findById, utilisé par JWT Strategy)
  async findOne(id: number): Promise<User | null> {
    if (!id || id <= 0) {
      return null;
    }

    return this.userReposistory.findOne({
      where: { id }
    });
  }
  
  //Update user
  async update(id: number, updateData: UpdateUserDto){
    // Check if user exists
    await this.findById(id);

    // Validate email if provided
    if (updateData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updateData.email)) {
        throw new ValidationException(
          "Email invalide"
        );
      }

      // Check if email already used by another user
      const existingUser = await this.userReposistory.findOne({
        where: { email: updateData.email }
      });

      if (existingUser && existingUser.id !== id) {
        throw new DuplicateException('Utilisateur', 'email', updateData.email);
      }
    }

    // Validate password if provided
    if (updateData.password && updateData.password.length < 6) {
      throw new ValidationException(
        'Mot de passe trop court (minimum 6 caractères)'
      );
    }

    const result = await this.userReposistory.update(id, updateData);

    if (result.affected === 0) {
      throw new NotFoundException('Utilisateur', id);
    }

    return this.findById(id);
  }
  
  //Delete user
  async delete(id: number){
    // Check if user exists
    const user = await this.findById(id);

    // 1. Supprimer tous les budgets personnels de l'utilisateur
    await this.userCategoryBudgetRepository.delete({ userId: id });

    // 2. Supprimer toutes les activités de l'utilisateur
    await this.activityRepository.delete({ user: { id } });

    // 3. Supprimer les settlements où l'utilisateur est impliqué
    await this.settlementRepository
      .createQueryBuilder()
      .delete()
      .where('fromUserId = :userId OR toUserId = :userId', { userId: id })
      .execute();

    // 4. Supprimer l'utilisateur des participants des dépenses
    const expenses = await this.expenseRepository
      .createQueryBuilder('expense')
      .leftJoinAndSelect('expense.participants', 'participant')
      .where('participant.id = :userId', { userId: id })
      .getMany();

    for (const expense of expenses) {
      expense.participants = expense.participants.filter(p => p.id !== id);
      await this.expenseRepository.save(expense);
    }

    // 5. Supprimer les dépenses payées par l'utilisateur
    await this.expenseRepository
      .createQueryBuilder()
      .delete()
      .where('paidById = :userId', { userId: id })
      .execute();

    // 6. Supprimer les memberships de l'utilisateur dans les groupes
    await this.groupMemberRepository.delete({ userId: id });

    // 7. Delete avatar file if exists
    if (user.avatar) {
      await this.deleteAvatarFile(user.avatar);
    }

    // 8. Finalement, supprimer l'utilisateur
    const result = await this.userReposistory.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Utilisateur', id);
    }

    return {
      message: 'Utilisateur supprimé avec succès',
      id
    };
  }

  //Update avatar
  async updateAvatar(id: number, filename: string) {
    const user = await this.findById(id);

    // Delete old avatar if exists
    if (user.avatar) {
      await this.deleteAvatarFile(user.avatar);
    }

    await this.userReposistory.update(id, { avatar: filename });

    return {
      message: 'Avatar mis à jour avec succès',
      avatar: filename,
      avatarUrl: `/uploads/avatars/${filename}`
    };
  }

  //Delete avatar
  async deleteAvatar(id: number) {
    const user = await this.findById(id);

    if (!user.avatar) {
      throw new ValidationException('Aucun avatar à supprimer');
    }

    await this.deleteAvatarFile(user.avatar);
    
    // Use query builder to set avatar to null
    await this.userReposistory
      .createQueryBuilder()
      .update()
      .set({ avatar: null as any })
      .where('id = :id', { id })
      .execute();

    return {
      message: 'Avatar supprimé avec succès'
    };
  }

  //Helper to delete avatar file
  private async deleteAvatarFile(filename: string) {
    const filePath = path.join(process.cwd(), 'uploads', 'avatars', filename);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du fichier avatar:', error);
    }
  }
  
}
