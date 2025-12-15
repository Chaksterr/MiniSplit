import { Injectable, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMember } from './group-member.entity';
import { NotFoundException, ValidationException } from '../common/exceptions';
import { AddMemberDto } from './dto/add-member.dto';
import { ActivityService } from '../activity/activity.service';
import { ActivityAction } from '../activity/activity.entity';

@Injectable()
export class GroupMemberService {
  constructor(
    @InjectRepository(GroupMember)
    private groupMemberRepository: Repository<GroupMember>,
    private activityService: ActivityService,
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
      isAdmin: data.isAdmin || false,
    });
    
    const savedMember = await this.groupMemberRepository.save(member);

    // Créer une activité
    await this.activityService.create({
      userId: data.userId,
      groupId: data.groupId,
      action: ActivityAction.MEMBER_JOINED,
      entityType: 'member',
      entityId: savedMember.id,
      details: {},
    });

    return savedMember;
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

  // Promouvoir un membre en admin
  async promoteToAdmin(id: number) {
    const member = await this.groupMemberRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!member) {
      throw new NotFoundException('Membre', id);
    }

    if (member.role === 'admin') {
      throw new ValidationException('Ce membre est déjà administrateur');
    }

    member.role = 'admin';
    await this.groupMemberRepository.save(member);

    return {
      message: 'Membre promu administrateur avec succès',
      member,
    };
  }

  // Compter le nombre d'admins dans un groupe
  async countAdmins(groupId: number): Promise<number> {
    return this.groupMemberRepository.count({
      where: { groupId, role: 'admin' },
    });
  }

  // Supprimer un membre
  async removeMember(id: number) {
    const member = await this.groupMemberRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!member) {
      throw new NotFoundException('Membre', id);
    }

    // Si c'est un admin, vérifier qu'il n'est pas le seul
    if (member.role === 'admin') {
      const adminCount = await this.countAdmins(member.groupId);
      if (adminCount <= 1) {
        throw new ForbiddenException(
          'Vous êtes le seul administrateur. Promouvez un autre membre avant de quitter le groupe.'
        );
      }
    }

    // Créer une activité avant de supprimer
    await this.activityService.create({
      userId: member.userId,
      groupId: member.groupId,
      action: ActivityAction.MEMBER_LEFT,
      entityType: 'member',
      entityId: id,
      details: {},
    });

    await this.groupMemberRepository.remove(member);
    return { message: 'Membre retiré avec succès' };
  }
}
