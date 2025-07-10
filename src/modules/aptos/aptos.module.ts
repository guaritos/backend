import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AccountTransactionService, ExtendedDataService } from './services';
import { AccountTransactionResolver, ExtendedDataResolver } from './resolvers';

@Module({
  imports: [ConfigModule],
  providers: [
    AccountTransactionService,
    ExtendedDataService,
    AccountTransactionResolver,
    ExtendedDataResolver,
  ],
  exports: [AccountTransactionService, ExtendedDataService],
})
export class AptosModule {}