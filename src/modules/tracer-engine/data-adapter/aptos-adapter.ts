import { Edge } from "@guaritos/tracer-engine/dist/engine/items/ttr_defs";
import { AccountTransaction } from "src/modules/aptos";

enum EventTypes {
    GAS_FEE_EVENT  = `0x1::aptos_coin::GasFeeEvent`,
    DEPOSIT_EVENT  = `0x1::coin::DepositEvent`,
    WITHDRAW_EVENT = `0x1::coin::WithdrawEvent`,
}

class SmartContractTypes {
    static SWAP = new Set([
        `0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12::scripts_v2::swap_into`,
    ]);
}

export class AptosAdapter {
    static parse_query_result(
        account_transactions: AccountTransaction[],
        swap_options?: {
            include_swap: boolean,
            filters?: {
                contract_addresses: Set<string>,
            },
        },
    ): Edge[] {        
        let edges: Edge[] = [];
        
        for (let t = 0; t < account_transactions.length; t++) {
            const transaction = account_transactions[t];

            const sender = transaction.user_transaction.sender;
            
            // "YYYY-MM-DD{T}HH:mm:ss:sssZ" -> epoch
            const timestamp = Date.parse(transaction.user_transaction.timestamp + "Z");

            // Store hash as version
            const version = transaction.user_transaction.version.toString();

            const fungible_asset_activities = transaction.fungible_asset_activities;

            let isSwap = false;

            const contract_address = transaction.user_transaction.entry_function_contract_address;

            for (let i = 0; i < fungible_asset_activities.length; i++) {
                const event = fungible_asset_activities[i];
                
                if (event.type === EventTypes.GAS_FEE_EVENT) {
                    continue;
                }
                
                if (SmartContractTypes.SWAP.has(event.entry_function_id_str)) {
                    isSwap = true;
                }

                if (swap_options.include_swap && isSwap && event.owner_address === sender && swap_options.filters.contract_addresses.has(contract_address)) {
                    if (event.type === EventTypes.WITHDRAW_EVENT) {
                        edges.push({
                            from: sender,
                            to: "",
                            value: event.amount,
                            symbol: event.metadata.symbol + '_' + event.asset_type,
                            timestamp: timestamp,
                            hash: version,
                        });
                    }
                    else if (event.type === EventTypes.DEPOSIT_EVENT) {
                        edges.push({
                            from: "",
                            to: sender,
                            value: event.amount,
                            symbol: event.metadata.symbol + '_' + event.asset_type,
                            timestamp: timestamp,
                            hash: version,
                        })
                    }
                }
                else if (!isSwap && event.owner_address !== sender && event.type === EventTypes.DEPOSIT_EVENT) {
                    edges.push({                        
                        from: sender,
                        to: event.owner_address,
                        value: event.amount,
                        symbol: event.metadata.symbol + '_' + event.asset_type,
                        timestamp: timestamp,
                        hash: version,
                    });
                }
            }
        }
        return edges;
    }
}