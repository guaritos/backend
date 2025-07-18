import { Injectable } from '@nestjs/common';
import { BaseAptosService } from './base-aptos.service';
import { ConfigService } from '@nestjs/config';
import { QueryOptions } from './account-transaction.service';

export interface BlacklistFilters {
  address?: string;
}

@Injectable()
export class BlacklistAccountService extends BaseAptosService {
  constructor(configService: ConfigService) {
    super(configService);
  }

  async getOwnerBlacklist(owner?: string): Promise<Array<any>> {
    const contractAddress = this.configService.get<string>('contract.GUARITOS_CONTRACT_ADDRESS');
    console.log('Contract Address:', contractAddress);
    const res = this.aptos.view({
        payload: {
            function: `${contractAddress}::nft_blacklist::get_blacklist_details`,
            functionArguments: [owner],
        },
    });
    return res
  }
}
