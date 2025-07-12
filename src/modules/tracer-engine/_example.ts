import { ConfigService } from "@nestjs/config";
import { AccountTransactionService } from "../aptos";
import { AptosAdapter } from "./data-adapter/aptos-adapter";
import { TracerEngine } from "@guaritos/tracer-engine";
import { writeFileSync } from "fs";

async function test() {
    const LIQUID_SWAP_ADDR = "0x190d44266241744264b964a37b8f09863167a12d3e70cda39376cfb4e3561e12";

    const trace_source = LIQUID_SWAP_ADDR
    const accountTransactionService = new AccountTransactionService(new ConfigService());

    const get_edges = async (node: string) => {
        // await new Promise(r => setTimeout(r, 1000));
        const data = await accountTransactionService.getAccountTransactionsByAddress(
            node,
            1000,
        ).catch(err => {
            console.error(err);
        })
        if (data) {
            return AptosAdapter.parse_query_result(data, {include_swap: false});
        }
    };
    const result = await new TracerEngine(trace_source, {enable_log: true}).startTrace(get_edges);
    console.log(result);
    const filename = `tracer-result-liquidswap-v0`;
    writeFileSync(`${filename}.json`, JSON.stringify(result, null, 2));
}

test();
