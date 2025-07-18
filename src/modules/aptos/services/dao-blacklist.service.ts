import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config/dist/config.service";
import { BaseAptosService } from "./base-aptos.service";
import { DaoBlacklist } from "../entities/dao-blacklist.entity";

@Injectable()
export class DaoBlacklistService extends BaseAptosService {
    constructor(configService: ConfigService) {
        super(configService);
    }

    async getDaoBlacklist(owner: string): Promise<DaoBlacklist> {
        const res = await this.aptos.view({
            payload: {
                function:
                    `${process.env.GUARITOS_CONTRACT_ADDRESS}::nft_blacklist::get_blacklist_details`,
                functionArguments: [owner],
            }
        });

        const daoBlacklist = new DaoBlacklist();
        // Assuming the first element in res contains the owner_address
        daoBlacklist.owner_address = res[0] as string;
        daoBlacklist.address = res[1] as string[];
        daoBlacklist.token_address = res[2] as string;
        return daoBlacklist;
    }
}