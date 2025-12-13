import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GroupMember } from '../../group-member/group-member.entity';

@Injectable()
export class GroupAdminGuard implements CanActivate {
  constructor(
    @InjectRepository(GroupMember)
    private groupMemberRepository: Repository<GroupMember>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.body.userId || request.query.userId;
    const groupId = request.params.id || request.params.groupId || request.body.groupId;

    if (!userId || !groupId) {
      throw new ForbiddenException('Informations manquantes');
    }

    const membership = await this.groupMemberRepository.findOne({
      where: { userId: parseInt(userId), groupId: parseInt(groupId) },
    });

    if (!membership || membership.role !== 'admin') {
      throw new ForbiddenException('Seul l\'administrateur du groupe peut effectuer cette action');
    }

    return true;
  }
}
