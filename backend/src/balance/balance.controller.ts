import { Controller, Get, Param } from '@nestjs/common';
import { BalanceService } from './balance.service';

@Controller('balances')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get('group/:groupId')
  getGroupBalances(@Param('groupId') groupId: number) {
    return this.balanceService.calculateGroupBalances(groupId);
  }
}
