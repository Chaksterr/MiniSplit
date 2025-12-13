import { Injectable, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMember } from './group-member.entity';
import { NotFoundException, ValidationException } from '../common/exceptions';
import { AddMemberDto } from './dto/add-member.dto';

@Injectable()
export class GroupMemberService {
  constructor(
    @InjectRepository(GroupMember)
    private groupMemberRepository: Repository<GroupMember>,
  ) {}

  // Vérifier si un utilisateur est admin du groupe
  async isGroupAdmin(userId: number, groupId: number): Promise<boolean> {
    const membership = await this.groupMemberRepository.findOne({
      where: { userId, groupId },
    });
    return membership?.role === 'admin';
  }

  // Ajouter un membre
  async addMember(data: AddMemberDto) {
    if (!data.userId || !data.groupId) {
      throw new ValidationException('userId et groupId requis');
    }

    // Vérifier si le membre existe déjà
    const existing = await this.groupMemberRepository.findOne({
      where: { userId: data.userId, groupId: data.groupId },
    });

    if (existing) {
      throw new ValidationException('Ce membre fait déjà partie du groupe');
    }

    const member = this.groupMemberRepository.create({
      userId: data.userId,
      groupId: data.groupId,
      role: 'member',
    });
    
    return await this.groupMemberRepository.save(member);
  }

  // Obtenir tous les membres d'un groupe
  async findMembersByGroup(groupId: number) {
    return this.groupMemberRepository.find({
      where: { groupId },
      relations: ['user'],
    });
  }

  // Obtenir tous les groupes d'un utilisateur
  async findGroupsByUser(userId: number) {
    return this.groupMemberRepository.find({
      where: { userId },
      relations: ['group'],
    });
  }

  // Supprimer un membre (seulement par admin)
  async removeMember(id: number) {
    const member = await this.groupMemberRepository.findOne({
      where: { id },
    });

    if (!member) {
      throw new NotFoundException('Membre', id);
    }

    await this.groupMemberRepository.remove(member);
    return { message: 'Membre retiré avec succès' };
  }
}
