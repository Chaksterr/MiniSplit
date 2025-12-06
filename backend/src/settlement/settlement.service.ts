import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settlement } from './settlement.entity';
import { CreateSettlementDto } from './dto/create-settlement.dto';
import { UpdateSettlementDto } from './dto/update-settlement.dto';
import { NotFoundException, ValidationException } from '../common/exceptions';

@Injectable()
export class SettlementService {
  constructor(
    @InjectRepository(Settlement)
    private settlementRepository: Repository<Settlement>,
  ) {}

  async create(data: CreateSettlementDto) {
    // Validation: fromUser != toUser
    if (data.fromUserId === data.toUserId) {
      throw new ValidationException('L\'utilisateur ne peut pas se rembourser lui-même');
    }

    const settlementData: any = {
      fromUser: { id: data.fromUserId },
      toUser: { id: data.toUserId },
      amount: data.amount,
      group: { id: data.groupId },
      date: data.date ? new Date(data.date) : new Date(),
      status: data.status || 'completed',
      notes: data.notes,
      proofImage: data.proofImage,
    };

    const settlement = this.settlementRepository.create(settlementData);
    return await this.settlementRepository.save(settlement);
  }

  async findAll() {
    return this.settlementRepository.find({
      order: { date: 'DESC' },
    });
  }

  async findByGroup(groupId: number) {
    return this.settlementRepository.find({
      where: { group: { id: groupId } },
      order: { date: 'DESC' },
    });
  }

  async findByUser(userId: number) {
    return this.settlementRepository
      .createQueryBuilder('settlement')
      .leftJoinAndSelect('settlement.fromUser', 'fromUser')
      .leftJoinAndSelect('settlement.toUser', 'toUser')
      .leftJoinAndSelect('settlement.group', 'group')
      .where('settlement.fromUserId = :userId', { userId })
      .orWhere('settlement.toUserId = :userId', { userId })
      .orderBy('settlement.date', 'DESC')
      .getMany();
  }

  async findById(id: number) {
    const settlement = await this.settlementRepository.findOne({ where: { id } });
    if (!settlement) {
      throw new NotFoundException('Remboursement', id);
    }
    return settlement;
  }

  async update(id: number, data: UpdateSettlementDto) {
    await this.findById(id);
    await this.settlementRepository.update(id, data);
    return this.findById(id);
  }

  async delete(id: number) {
    await this.findById(id);
    await this.settlementRepository.delete(id);
    return { message: 'Remboursement supprimé avec succès' };
  }
}
