import { Resolver, Query } from '@nestjs/graphql';
import { IndexerService } from './indexer.service';
import { AccountData } from '@aptos-labs/ts-sdk';
import { AccountDataDto } from './indexer.dto';

@Resolver('Indexer')
export class IndexerResolver {
    constructor(private readonly aptosService: IndexerService) { }

    @Query(() => AccountDataDto)
    async getAccount() {
        const info = await this.aptosService.getAccountInfo('0x0000000000000000000000000000000000000000000000000000000000000001');
        const accountData: AccountDataDto = {
            authenticationKey: info.authentication_key,
            sequenceNumber: info.sequence_number
        };
        return accountData;
    }

    @Query(() => String)
    async getLedgerInfo(){
        const info = await this.aptosService.getLedgerInfo();
        
        return JSON.stringify(info);
    }
}