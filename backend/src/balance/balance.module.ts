import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { Expense } from '../expense/expense.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Expense])],
  controllers: [BalanceController],
  providers: [BalanceService],
})
export class BalanceModule {}
