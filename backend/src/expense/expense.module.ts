import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './expense.entity';
import { ExpenseService } from './expense.service';
import { ExpenseController } from './expense.controller';
import { ActivityModule } from '../activity/activity.module';
import { GroupMemberModule } from '../group-member/group-member.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Expense]),
    ActivityModule,
    GroupMemberModule,
  ],
  providers: [ExpenseService],
  controllers: [ExpenseController],
  exports: [ExpenseService], // Export for use in balance calculations
})
export class ExpenseModule {}
