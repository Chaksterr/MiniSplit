import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from './activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';

@Injectable()
export class ActivityService {
  constructor(
    @InjectRepository(Activity)
    private activityRepository: Repository<Activity>,
  ) {}

  async create(data: CreateActivityDto) {
    const activityData: any = {
      user: { id: data.userId },
      action: data.action,
      details: data.details || {},
    };

    if (data.groupId) {
      activityData.group = { id: data.groupId };
    }

    if (data.entityType) {
      activityData.entityType = data.entityType;
    }

    if (data.entityId) {
      activityData.entityId = data.entityId;
    }

    const activity = this.activityRepository.create(activityData);
    return await this.activityRepository.save(activity);
  }

  async findAll() {
    return this.activityRepository.find({
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async findByGroup(groupId: number) {
    return this.activityRepository.find({
      where: { group: { id: groupId } },
      order: { createdAt: 'DESC' },
    });
  }

  async findByUser(userId: number) {
    return this.activityRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }
}
