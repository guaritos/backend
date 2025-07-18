import { Injectable, Logger, LoggerService } from '@nestjs/common';
import { RuleService } from './rule.service';
import { RuleActionService } from './rule-action.service';
import { Rule } from './interfaces';
import { ComparisonOp, Condition, PlainCondition } from './types/rule.type';
import { QueryEngineService } from './query-engine.service';
import { AlertEngineService } from '../alert-engine/alert-engine.service';
import { EventsGateway } from '../events/events.gateway';
import { TracerEngineService } from '../tracer-engine/tracer-engine.service';
import { Alert } from '../alert-engine/interfaces';
import * as fs from 'fs';
import { Field } from '@nestjs/graphql';
import { BlacklistAccountService } from '../aptos/services/blacklist-account.service';

@Injectable()
export class RuleEngineService {
  private metadata: any;
  constructor(
    private readonly eventGateway: EventsGateway,
    private readonly action: RuleActionService,
    private readonly alertEngine: AlertEngineService,
    private readonly queryEngine: QueryEngineService,
    private readonly tracerEngine: TracerEngineService,
    private readonly blacklistAccountService: BlacklistAccountService,
  ) {
    const template = JSON.parse(fs.readFileSync(`src/meta/template.json`, 'utf-8'));
    this.metadata = this.queryEngine.getAllFields(template)
  }

  async runRule(rule: Rule): Promise<any[]> {
    try {
      // const dataset = JSON.parse(fs.readFileSync(`./logs/76-dataset.json`, 'utf-8'));
      const dataset = JSON.parse(fs.readFileSync(`tracer-result-liquidswap-v0.json`, 'utf-8'));
      
      // const dataset = await this.tracerEngine.traceByAddress(rule.source);
      // const normalizedDataset = normalizeDataset(dataset);
      // fs.writeFileSync(
      //   `./logs/${rule.id}-dataset.json`,
      //   JSON.stringify(normalizedDataset, null, 2),
      // );
      return await this.execute(rule, dataset);
    } catch (error) {
      this.eventGateway.sendEventToUser(rule.user_id, 'alert', 'error', {
        title: `Error running rule "${rule.name}"`,
        message: `${error.message}`,
      });
      throw new Error(
        `Failed to run rule ${rule.id} with error: ${error.message}`,
      );
    }
  }

  async execute(rule: Rule, dataset: any): Promise<any> {
    const { when } = rule;
    if (!when && !rule.aggregate) {
      throw new Error(
        `Rule ${rule.id} has no condition or aggregation defined.`,
      );
    }

    const queryResult = this.queryEngine.compile(when)(dataset);
    const aggregateResult = this.queryEngine.compileAggregate(rule.aggregate)(
      dataset,
    );

    const ownerBlacklist = rule.in_owner_blacklist ? await this.blacklistAccountService.getOwnerBlacklist(rule.user_id) : [];
    const inOwnerBlacklist = this.queryEngine.isInBlacklist(dataset, ownerBlacklist);
    if ((queryResult.length > 0 && aggregateResult.length > 0) || inOwnerBlacklist) {
      const result = {
        queryResult,
        aggregateResult,
        inOwnerBlacklist,
      };
      try {
        const context = await this.alertEngine.createAlert({
          rule_id: rule.id,
          result: result,
          data: dataset,
          actions_fired: [],
          status: 'pending',
          message: 'Alert triggered because rule condition matched',
        });
        await this.notifyRuleTriggered(rule.user_id, rule.name, context);
      } catch (error) {
        console.error('Error creating alert:', error);
        throw new Error('Failed to create alert');
      }
      await this.action.run(rule.then, rule.id, result);
    }

    return {
      queryResult,
      aggregateResult,
    };
  }

  private async notifyRuleTriggered(
    userId: string,
    ruleName: string,
    context: Alert,
  ) {
    this.eventGateway.sendEventToUser(userId, 'alert', 'info', {
      title: `Rule "${ruleName}" has been triggered.`,
      context,
    });
  }

  async getDatasetMetadata(): Promise<any> {
    return this.metadata;
  }
}
