import { Inject, Injectable } from '@nestjs/common';
import { AccountTransactionService } from '../aptos';
import { ConfigService } from '@nestjs/config';
import { AptosAdapter } from './data-adapter/aptos-adapter';
import { TracerEngine, TraceResult } from '@guaritos/tracer-engine';
import { Edge } from '@guaritos/tracer-engine/dist/engine/items/ttr_defs';

@Injectable()
export class TracerEngineService {
  constructor(
    private accountTransactionService: AccountTransactionService,
  ) {
    console.log(accountTransactionService);
  }

  async traceByAddress(address: string): Promise<TraceResult> {
    try {
      const result = await new TracerEngine(address, {
        enable_log: false,
      }).startTrace(this.getEdgesByAddress.bind(this));
      return result;
    } catch (error) {
      console.error(`Error tracing address ${address}:`, error);
      throw new Error(`Failed to trace address ${address}`);
    }
  }

  private async getEdgesByAddress(node: string): Promise<Edge[]> {
    try {
      const data =
        await this.accountTransactionService.getAccountTransactionsByAddress(
          node,
          1000,
        );

      if (!data) {
        throw new Error(`No transactions found for address: ${node}`);
      }

      return AptosAdapter.parse_query_result(data, {
        include_swap: false,
      });
    } catch (error) {
      console.error(`Error fetching edges for node ${node}:`, error);
      throw new Error(`Failed to fetch edges for node ${node}`);
    }
  }
}
