import { Resolver, Query, Args } from '@nestjs/graphql';
import { AccountTransactionService, DaoBlacklistService } from '../services';
import { AccountTransaction } from '../entities';
import {
  AccountTransactionFiltersInput,
  GetAccountTransactionsByVersionInput,
  GetAccountTransactionsByAddressInput,
} from '../inputs';
import { string } from 'zod';
import { DaoBlacklist } from '../entities/dao-blacklist.entity';

@Resolver(() => AccountTransaction)
export class AccountTransactionResolver {
  constructor(
    private readonly accountTransactionService: AccountTransactionService,
    private readonly daoBlacklistService: DaoBlacklistService
  ) {}

  @Query(() => [AccountTransaction], { name: 'accountTransactions' })
  async getAccountTransactions(
    @Args('filters', { type: () => AccountTransactionFiltersInput,nullable: true })
    filters?: AccountTransactionFiltersInput
  ): Promise<AccountTransaction[]> {
    return this.accountTransactionService.getAccountTransactions(filters);
  }

  @Query(() => [AccountTransaction], { name: 'accountTransactionsByVersion' })
  async getAccountTransactionsByVersion(
    @Args('input', { type: () => GetAccountTransactionsByVersionInput })
    input: GetAccountTransactionsByVersionInput
  ): Promise<AccountTransaction[]> {
    return this.accountTransactionService.getAccountTransactionsByVersion(
      input.transaction_version,
      input.account_address,
      input.limit
    );
  }

  @Query(() => [AccountTransaction], { name: 'accountTransactionsByAddress' })
  async getAccountTransactionsByAddress(
    @Args('input', { type: () => GetAccountTransactionsByAddressInput })
    input: GetAccountTransactionsByAddressInput
  ): Promise<AccountTransaction[]> {
    return this.accountTransactionService.getAccountTransactionsByAddress(
      input.account_address,
      input.limit,
      input.offset
    );
  }

  @Query(() => DaoBlacklist, { name: 'DaoBlacklist' })
  async getDaoBlacklist(
    @Args('accountAddress') accountAddress: string
  ): Promise<DaoBlacklist> {
    return this.daoBlacklistService.getDaoBlacklist(accountAddress);
  }
}