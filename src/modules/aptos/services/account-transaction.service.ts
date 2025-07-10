import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAptosService } from './base-aptos.service';
import { AccountTransaction } from '../entities';

export interface AccountTransactionFilters {
  transaction_version?: string;
  account_address?: string;
  limit?: number;
  offset?: number;
}

export interface QueryOptions {
  limit?: number;
  offset?: number;
  orderBy?: string;
}

interface AccountTransactionResponse {
  account_transactions: AccountTransaction[];
}

@Injectable()
export class AccountTransactionService extends BaseAptosService {
  constructor(configService: ConfigService) {
    super(configService);
  }

  async getAccountTransactions(
    filters: AccountTransactionFilters,
    options: QueryOptions = {}
  ): Promise<AccountTransaction[]> {
    const query = this.buildAccountTransactionQuery();
    const variables = this.buildQueryVariables(filters, options);
    
    const response = await this.executeGraphQLQuery<AccountTransactionResponse>(
      query, 
      variables
    );
    
    return response.account_transactions;
  }

  async getAccountTransactionsByVersion(
    transactionVersion: string,
    accountAddress: string,
    limit: number = 10
  ): Promise<AccountTransaction[]> {
    return this.getAccountTransactions({
      transaction_version: transactionVersion,
      account_address: accountAddress,
      limit
    });
  }

  async getAccountTransactionsByAddress(
    accountAddress: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<AccountTransaction[]> {
    return this.getAccountTransactions({
      account_address: accountAddress,
      limit,
      offset
    });
  }

  private buildAccountTransactionQuery(): string {
    return `
      query GetAccountTransactions($where: account_transactions_bool_exp, $limit: Int, $offset: Int) {
        account_transactions(
          where: $where
          limit: $limit
          offset: $offset
        ) {
          account_address
          fungible_asset_activities {
            amount
            asset_type
            entry_function_id_str
            event_index
            is_gas_fee
            is_transaction_success
            type
            owner_address
            metadata {
              icon_uri
              project_uri
            }
          }
          user_transaction {
            entry_function_contract_address
            entry_function_function_name
          }
        }
      }
    `;
  }

  private buildQueryVariables(
    filters: AccountTransactionFilters,
    options: QueryOptions
  ): any {
    const where: any = {};

    if (filters.transaction_version) {
      where.transaction_version = { _eq: filters.transaction_version };
    }

    if (filters.account_address) {
      where.account_address = { _eq: filters.account_address };
    }

    return {
      where,
      limit: options.limit || filters.limit || 10,
      offset: options.offset || filters.offset || 0,
    };
  }
}