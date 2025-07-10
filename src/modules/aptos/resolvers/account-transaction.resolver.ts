import { Resolver, Query, Args } from '@nestjs/graphql';
import { AccountTransactionService } from '../services';
import { AccountTransaction } from '../entities';
import {
  AccountTransactionFiltersInput,
  GetAccountTransactionsByVersionInput,
  GetAccountTransactionsByAddressInput,
} from '../inputs';

@Resolver(() => AccountTransaction)
export class AccountTransactionResolver {
  constructor(
    private readonly accountTransactionService: AccountTransactionService
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
}