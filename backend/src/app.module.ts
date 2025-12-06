import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { GroupModule } from './group/group.module';
import { GroupMemberModule } from './group-member/group-member.module';
import { ExpenseModule } from './expense/expense.module';
import { BalanceModule } from './balance/balance.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ActivityModule } from './activity/activity.module';
import { SettlementModule } from './settlement/settlement.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT!),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    AuthModule,
    UserModule,
    GroupModule,
    GroupMemberModule,
    ExpenseModule,
    BalanceModule,
    CategoryModule,
    ActivityModule,
    SettlementModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
