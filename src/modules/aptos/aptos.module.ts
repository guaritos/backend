import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountTransactionService, ExtendedDataService,DaoBlacklistService } from './services';
import { AccountTransactionResolver, ExtendedDataResolver } from './resolvers';
import { BlacklistAccountService } from './services/blacklist-account.service';

@Module({
  imports: [ConfigModule],
  providers: [
    AccountTransactionService,
    ExtendedDataService,
    DaoBlacklistService,
    AccountTransactionResolver,
    ExtendedDataResolver,
    BlacklistAccountService,
  ],
  exports: [AccountTransactionService, ExtendedDataService, BlacklistAccountService, DaoBlacklistService],
})
export class AptosModule {}