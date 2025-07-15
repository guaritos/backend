import { Edge } from "@guaritos/tracer-engine/dist/engine/items/ttr_defs";
import { AccountTransaction } from "src/modules/aptos";

enum EventTypes {
    GAS_FEE_EVENT  = `0x1::aptos_coin::GasFeeEvent`,
    DEPOSIT_EVENT  = `0x1::coin::DepositEvent`,
    WITHDRAW_EVENT = `0x1::coin::WithdrawEvent`,
}

export class AptosAdapter {
    static parse_query_result(
        account_transactions: AccountTransaction[],
        swap_options: {
            include_swap: boolean,
            swap_filters?: {
                contract_addresses_predicate?: (contract_address: string) => boolean,
                event_types_predicate?: (event_type: string) => boolean,
            },
        },
        fungible_asset_predicate?: (asset_type: string) => boolean,
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

            const contract_address = transaction.user_transaction.entry_function_contract_address;
            const event_type = transaction.user_transaction.entry_function_id_str;

            const transaction_metadata = {
                contract_address: contract_address,
                event_type: event_type,
            }

            let isSwap = false;
            isSwap = (swap_options.include_swap && 
                typeof(swap_options.swap_filters) !== 'undefined' && 
                typeof(swap_options.swap_filters.contract_addresses_predicate) !== 'undefined' && 
                typeof(swap_options.swap_filters.event_types_predicate) !== 'undefined' &&
                swap_options.swap_filters.contract_addresses_predicate(contract_address) &&
                swap_options.swap_filters.event_types_predicate(event_type)
            );

            for (let i = 0; i < fungible_asset_activities.length; i++) {
                const event = fungible_asset_activities[i];
                
                if (event.type === EventTypes.GAS_FEE_EVENT) {
                    continue;
                }

                if ((fungible_asset_predicate !== undefined) && !fungible_asset_predicate(event.asset_type)) {
                    continue;
                }

                if (swap_options.include_swap && isSwap && event.owner_address === sender) {
                    if (event.type === EventTypes.WITHDRAW_EVENT) {
                        edges.push({
                            from: sender,
                            to: "",
                            value: event.amount,
                            symbol: event.metadata.symbol + '_' + event.asset_type,                            
                            timestamp: timestamp,
                            hash: version,
                            metadata: transaction_metadata,
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
                            metadata: transaction_metadata,
                        })
                    }
                }
                else if (event.owner_address !== sender && event.type === EventTypes.DEPOSIT_EVENT) {
                    edges.push({                        
                        from: sender,
                        to: event.owner_address,
                        value: event.amount,
                        symbol: event.metadata.symbol + '_' + event.asset_type,
                        timestamp: timestamp,
                        hash: version,
                        metadata: transaction_metadata,
                    });
                }
            }
        }
        return edges;
    }
}