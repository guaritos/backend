import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountTransactionService, ExtendedDataService,DaoBlacklistService } from './services';
import { AccountTransactionResolver, ExtendedDataResolver } from './resolvers';

@Module({
  imports: [ConfigModule],
  providers: [
    AccountTransactionService,
    ExtendedDataService,
    DaoBlacklistService,
    AccountTransactionResolver,
    ExtendedDataResolver,
  ],
  exports: [AccountTransactionService, ExtendedDataService, DaoBlacklistService],
})
export class AptosModule {}