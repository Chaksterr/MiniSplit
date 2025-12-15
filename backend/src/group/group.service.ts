import { Injectable, Inject, forwardRef } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group} from './group.entity';
import { NotFoundException, ValidationException, DuplicateException } from '../common/exceptions';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { GroupMemberService } from '../group-member/group-member.service';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(Group)
    private groupReposistory: Repository<Group>,
    @Inject(forwardRef(() => GroupMemberService))
    private groupMemberService: GroupMemberService,
  ) {}

  // Générer un code unique de 8 caractères
  private generateUniqueCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Sans I, O, 0, 1 pour éviter confusion
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  // Vérifier et générer un code unique
  private async ensureUniqueCode(): Promise<string> {
    let code = this.generateUniqueCode();
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const existing = await this.groupReposistory.findOne({ where: { code } });
      if (!existing) {
        return code;
      }
      code = this.generateUniqueCode();
      attempts++;
    }

    throw new ValidationException('Impossible de générer un code unique');
  }

    //Create group
    async create(data: CreateGroupDto, userId?: number){
      // Validate required fields
      if (!data.name || data.name.trim().length === 0) {
        throw new ValidationException(
          'Nom du groupe requis'
        );
      }

      // Générer un code unique pour le groupe
      const code = await this.ensureUniqueCode();

      try {
        const group = this.groupReposistory.create({
          ...data,
          code
        });
        const savedGroup = await this.groupReposistory.save(group);
        
        // Ajouter automatiquement le créateur comme membre admin
        if (userId) {
          await this.groupMemberService.addMember({
            groupId: savedGroup.id,
            userId: userId,
            isAdmin: true,
          });
        }
        
        return savedGroup;
      } catch (error) {
        throw new ValidationException(
          'Impossible de créer le groupe'
        );
      }
    }
    
    //Get groups where user is member
    async findUserGroups(userId: number){
      const memberships = await this.groupMemberService.findGroupsByUser(userId);
      const groupIds = memberships.map(m => m.groupId);
      
      if (groupIds.length === 0) {
        return [];
      }
      
      return this.groupReposistory
        .createQueryBuilder('group')
        .leftJoinAndSelect('group.memberships', 'membership')
        .leftJoinAndSelect('membership.user', 'user')
        .leftJoinAndSelect('group.expenses', 'expense')
        .leftJoinAndSelect('expense.paidBy', 'paidBy')
        .leftJoinAndSelect('expense.participants', 'participants')
        .leftJoinAndSelect('expense.category', 'category')
        .where('group.id IN (:...groupIds)', { groupIds })
        .getMany();
    }

    //Get all groups
    async findAll(){
        return this.groupReposistory.find({
          relations: [
            'memberships', 
            'memberships.user',
            'expenses', 
            'expenses.paidBy', 
            'expenses.participants',
            'expenses.category'
          ],
        });
    }

    //Get groups by category - DEPRECATED (categories removed from groups)
    async findByCategory(category: string){
        // Les catégories de groupe ont été supprimées, retourner tous les groupes
        return this.findAll();
    }

    //Get group by id
    async findById(id: number){
        if (!id || id <= 0) {
          throw new ValidationException(
            'ID invalide'
          );
        }

        const group = await this.groupReposistory.findOne({
          where: { id },
          relations: [
            'memberships', 
            'memberships.user',
            'expenses', 
            'expenses.paidBy', 
            'expenses.participants',
            'expenses.category'
          ],
        });

        if (!group) {
          throw new NotFoundException('Groupe', id);
        }

        return group;
    }

    //Find group by name
    async findByName(name: string){
      if (!name || name.trim().length === 0) {
        throw new ValidationException(
          'Nom du groupe requis'
        );
      }

      const group = await this.groupReposistory.findOneBy({name});

      if (!group) {
        throw new NotFoundException('Groupe', name);
      }

      return group;
    }

    //Find group by code
    async findByCode(code: string){
      if (!code || code.trim().length === 0) {
        throw new ValidationException(
          'Code du groupe requis'
        );
      }

      const group = await this.groupReposistory.findOne({
        where: { code },
        relations: [
          'memberships', 
          'memberships.user',
          'expenses', 
          'expenses.paidBy', 
          'expenses.participants',
          'expenses.category'
        ],
      });

      if (!group) {
        throw new NotFoundException('Groupe', code);
      }

      return group;
    }

    //Update group (admin seulement)
    async update(id: number, updateData: UpdateGroupDto, userId?: number){
        // Check if group exists
        await this.findById(id);

        // Validate name if provided
        if (updateData.name && updateData.name.trim().length === 0) {
          throw new ValidationException(
            'Nom du groupe requis'
          );
        }

        // Note: On ne vérifie plus les doublons de nom car le code unique identifie le groupe

        const result = await this.groupReposistory.update(id, updateData);

        if (result.affected === 0) {
          throw new NotFoundException('Groupe', id);
        }

        return this.findById(id);
    }

    //Delete group (admin seulement)
    async delete(id: number, userId?: number){
        // Check if group exists
        await this.findById(id);

        const result = await this.groupReposistory.delete(id);

        if (result.affected === 0) {
          throw new NotFoundException('Groupe', id);
        }

        return {
          message: 'Groupe supprimé avec succès',
          id
        };
    }
    
}

