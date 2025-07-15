import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseAptosService } from './base-aptos.service';
import { AccountBalance, TransactionHistoryItem } from '../entities';

@Injectable()
export class ExtendedDataService extends BaseAptosService {
  constructor(configService: ConfigService) {
    super(configService);
  }

  async getAccountBalances(accountAddress: string): Promise<AccountBalance[]> {
    const query = `
      query GetAccountBalances($address: String!) {
        current_fungible_asset_balances(
          where: {owner_address: {_eq: $address}}
        ) {
          amount
          asset_type
          metadata {
            name
            symbol
            decimals
            icon_uri
          }
        }
      }
    `;

    const variables = { address: accountAddress };
    const response = await this.executeGraphQLQuery<{ current_fungible_asset_balances: AccountBalance[] }>(query, variables);
    return response.current_fungible_asset_balances;
  }

  async getAccountNFTs(accountAddress: string, limit: number = 10): Promise<any[]> {
    const query = `
      query GetAccountNFTs($address: String!, $limit: Int) {
        current_token_ownerships_v2(
          where: {
            owner_address: {_eq: $address}
            amount: {_gt: "0"}
          }
          limit: $limit
        ) {
          token_data_id
          amount
          current_token_data {
            token_name
            collection_id
            description
            token_uri
            metadata {
              image
              name
              description
            }
          }
        }
      }
    `;

    const variables = { address: accountAddress, limit };
    const response = await this.executeGraphQLQuery<{ current_token_ownerships_v2: any[] }>(query, variables);
    return response.current_token_ownerships_v2;
  }

  async getTransactionHistory(
    accountAddress: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<TransactionHistoryItem[]> {
    const query = `
      query GetTransactionHistory($address: String!, $limit: Int, $offset: Int) {
        account_transactions(
          where: {account_address: {_eq: $address}}
          limit: $limit
          offset: $offset
          order_by: {transaction_version: desc}
        ) {
          transaction_version
          account_address
          user_transaction {
            timestamp
            entry_function_id_str
            gas_used
            success
          }
        }
      }
    `;

    const variables = { address: accountAddress, limit, offset };
    const response = await this.executeGraphQLQuery<{ account_transactions: TransactionHistoryItem[] }>(query, variables);
    return response.account_transactions;
  }
}