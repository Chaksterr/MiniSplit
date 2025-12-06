import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMember } from './group-member.entity';
import { NotFoundException, ValidationException, DuplicateException, BusinessException } from '../common/exceptions';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class GroupMemberService {
  constructor(
    @InjectRepository(GroupMember)
    private gmRepository: Repository<GroupMember>,
  ) {}

  async addMember(data: AddMemberDto) {
    // Check if user is already a member of this group
    const existingMember = await this.gmRepository.findOne({
      where: { 
        user: { id: data.userId },
        group: { id: data.groupId }
      }
    });

    if (existingMember) {
      throw new BusinessException(
        'Utilisateur déjà membre du groupe'
      );
    }

    try {
      const gm = this.gmRepository.create({
        user: { id: data.userId },
        group: { id: data.groupId }
      });
      return await this.gmRepository.save(gm);
    } catch (error) {
      throw new ValidationException(
        'Impossible d\'ajouter le membre'
      );
    }
  }

  async removeMember(id: number) {
    if (!id || id <= 0) {
      throw new ValidationException(
        'ID invalide'
      );
    }

    // Check if membership exists
    const member = await this.gmRepository.findOne({ where: { id } });
    if (!member) {
      throw new NotFoundException('Membre du groupe', id);
    }

    const result = await this.gmRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Membre du groupe', id);
    }

    return {
      message: 'Membre retiré du groupe avec succès',
      id
    };
  }

  async findMembersByGroup(groupId: number) {
    if (!groupId || groupId <= 0) {
      throw new ValidationException(
        'ID du groupe invalide'
      );
    }

    return this.gmRepository.find({ 
      where: { group: { id: groupId } }, 
      relations: ['user', 'group'] 
    });
  }

  async findGroupsByUser(userId: number) {
    if (!userId || userId <= 0) {
      throw new ValidationException(
        'ID de l\'utilisateur invalide'
      );
    }

    return this.gmRepository.find({ 
      where: { user: { id: userId } }, 
      relations: ['group', 'user'] 
    });
  }
}