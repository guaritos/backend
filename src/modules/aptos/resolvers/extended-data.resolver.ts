import { Resolver, Query, Args, Int } from '@nestjs/graphql';
import { ExtendedDataService } from '../services';
import { AccountBalance, TransactionHistoryItem } from '../entities';

@Resolver()
export class ExtendedDataResolver {
  constructor(
    private readonly extendedDataService: ExtendedDataService
  ) {}

  @Query(() => [AccountBalance], { name: 'accountBalances' })
  async getAccountBalances(
    @Args('accountAddress') accountAddress: string
  ): Promise<AccountBalance[]> {
    return this.extendedDataService.getAccountBalances(accountAddress);
  }

  @Query(() => [String], { name: 'accountNFTs' })
  async getAccountNFTs(
    @Args('accountAddress') accountAddress: string,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number
  ): Promise<any[]> {
    return this.extendedDataService.getAccountNFTs(accountAddress, limit);
  }

  @Query(() => [TransactionHistoryItem], { name: 'transactionHistory' })
  async getTransactionHistory(
    @Args('accountAddress') accountAddress: string,
    @Args('limit', { type: () => Int, defaultValue: 50 }) limit: number,
    @Args('offset', { type: () => Int, defaultValue: 0 }) offset: number
  ): Promise<TransactionHistoryItem[]> {
    return this.extendedDataService.getTransactionHistory(
      accountAddress,
      limit,
      offset
    );
  }
}