import { Injectable, OnModuleInit } from '@nestjs/common';
import { Aptos, Network,AptosConfig } from '@aptos-labs/ts-sdk';

@Injectable()
export class IndexerService implements OnModuleInit {
  private aptos: Aptos;

  onModuleInit() {
    const config = new AptosConfig({network: Network.TESTNET});
    this.aptos = new Aptos( config );
  }

  async getAccountInfo(address: string) {
    return this.aptos.getAccountInfo({ accountAddress: address });
  }

  async getLedgerInfo() {
    return this.aptos.getLedgerInfo();
  }


  
}
