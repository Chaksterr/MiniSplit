import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { GroupMember } from '../group-member/group-member.entity';
import { Expense } from '../expense/expense.entity';
import { Settlement } from '../settlement/settlement.entity';
import { Activity } from '../activity/activity.entity';
import { UserCategoryBudget } from '../category/user-category-budget.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      GroupMember,
      Expense,
      Settlement,
      Activity,
      UserCategoryBudget,
    ])
  ],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService], // Export UserService pour AuthModule
})
export class UserModule {}
