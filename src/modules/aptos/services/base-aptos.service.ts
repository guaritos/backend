import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Aptos, AptosConfig, ClientConfig, Network } from '@aptos-labs/ts-sdk';
import { config } from 'dotenv';
config();

@Injectable()
export abstract class BaseAptosService {
  protected readonly logger = new Logger(BaseAptosService.name);
  protected aptos: Aptos;
  protected indexerUrl: string;

  constructor(protected configService: ConfigService) {
    const network = this.configService.get<Network>('APTOS_NETWORK', Network.TESTNET);
    const customIndexerUrl = this.configService.get<string>('APTOS_INDEXER_URL');
    const clientConfig: ClientConfig = {
      API_KEY: process.env.APTOS_BUILD_API_KEY
    }
    
    const config = new AptosConfig({ 
      network,
      indexer: customIndexerUrl,
      clientConfig
    });
    this.aptos = new Aptos(config);
    this.indexerUrl = customIndexerUrl || this.getDefaultIndexerUrl(network);
    
    this.logger.log(`Initialized Aptos service for network: ${network}`);
  }

  private getDefaultIndexerUrl(network: Network): string {
    switch (network) {
      case Network.MAINNET:
        return 'https://api.mainnet.aptoslabs.com/v1/graphql';
      case Network.TESTNET:
        return 'https://api.testnet.aptoslabs.com/v1/graphql';
      case Network.DEVNET:
        return 'https://api.devnet.aptoslabs.com/v1/graphql';
      default:
        return 'https://api.mainnet.aptoslabs.com/v1/graphql';
    }
  }

  protected async executeGraphQLQuery<T>(query: string, variables?: any): Promise<T> {
    try {
      // this.logger.debug('Executing GraphQL query', { query, variables });
      
      const response = await fetch(this.indexerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.APTOS_BUILD_API_KEY}`,
        },
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.statusText}`);
      }

      const result = await response.json();

      if (result.errors) {
        this.logger.error('GraphQL errors', result.errors);
        throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
      }

      return result.data;
    } catch (error) {
      this.logger.error('Failed to execute GraphQL query', error);
      throw error;
    }
  }
}