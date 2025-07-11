import { Injectable } from '@nestjs/common';
import { RuleService } from './rule.service';
import { RuleActionService } from './rule-action.service';
import { Rule } from './interfaces';
import { ComparisonOp, PlainCondition } from './types/rule.type';
import { QueryEngineService } from './query-engine.service';
import { AlertEngineService } from '../alert-engine/alert-engine.service';
import { filter } from 'rxjs';
import { EventsGateway } from '../events/events.gateway';
import { Alert } from '../alert-engine/interfaces';

@Injectable()
export class RuleEngineService {
  constructor(
    private readonly eventGateway: EventsGateway,
    private readonly action: RuleActionService,
    private readonly alertEngine: AlertEngineService,
    private readonly queryEngine: QueryEngineService,
  ) {}
  
  async execute(rule: Rule, dataset: any): Promise<any[]> {
    const { when } = rule;
    if (!when && !rule.aggregate) {
      throw new Error(
        `Rule ${rule.id} has no condition or aggregation defined.`,
      );
    }

    const filtered = this.queryEngine.compile(when)(dataset);
    const agg = this.queryEngine.compileAggregate(rule.aggregate)(filtered);

    if (filtered.length > 0 && agg.length > 0) {
      console.log(
        `Rule ${rule.id} matched with ${filtered.length} items, executing actions...`,
      );
      try {
        const context = await this.alertEngine.createAlert({
          rule_id: rule.id,
          result: filtered,
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
      await this.action.run(rule.then, rule.id, filtered);
    }

    return filtered;
  }

  async notifyRuleTriggered(userId: string, ruleName: string, context: Alert) {
    this.eventGateway.sendEventToUser(userId, 'alert', {
      title: `Rule "${ruleName}" has been triggered.`,
      context,
    });
  }

  // async queryConditionTree(condition: any, context: any): Promise<boolean> {
  //   if (Array.isArray(condition)) {
  //     return condition.every((cond) => this.evaluateCondition(cond, context));
  //   } else if (typeof condition === 'object') {
  //     return this.evaluateRule(condition, context);
  //   }
  //   return false;
  // }

  // private async evaluateCondition(
  //   condition: any,
  //   context: any,
  // ): Promise<boolean> {
  //   if (condition.type === 'aggregate') {
  //     const value = context[condition.field];
  //     return this.evaluateAggregateCondition(value, condition);
  //   } else if (condition.type === 'exists') {
  //     return this.evaluateExistenceCondition(context, condition);
  //   } else if (condition.type === 'plain') {
  //     return this.evaluatePlainCondition(context, condition);
  //   } else if (condition.and || condition.or || condition.not) {
  //     return this.evaluateLogicalRule(condition, context);
  //   }
  //   return false; // Default case
  // }

  // evaluateAggregateCondition(
  //   value: any,
  //   condition: any,
  // ): boolean | PromiseLike<boolean> {
  //   switch (condition.aggregate) {
  //     case 'count':
  //       return Array.isArray(value) && value.length >= condition.value;
  //     case 'sum':
  //       return (
  //         Array.isArray(value) &&
  //         value.reduce((acc, v) => acc + v, 0) >= condition.value
  //       );
  //     case 'avg':
  //       return (
  //         Array.isArray(value) &&
  //         value.reduce((acc, v) => acc + v, 0) / value.length >= condition.value
  //       );
  //     case 'min':
  //       return Math.min(...value) >= condition.value;
  //     case 'max':
  //       return Math.max(...value) <= condition.value;
  //     default:
  //       return false;
  //   }
  // }

  // evaluateExistenceCondition(
  //   context: any,
  //   condition: any,
  // ): boolean | PromiseLike<boolean> {
  //   if (condition.operator === 'true') {
  //     return (
  //       context[condition.field] !== undefined &&
  //       context[condition.field] !== null &&
  //       context[condition.field].length > 0
  //     );
  //   } else if (condition.operator === 'false') {
  //     return (
  //       context[condition.field] === undefined ||
  //       context[condition.field] === null ||
  //       context[condition.field].length === 0
  //     );
  //   }
  //   return;
  // }

  // evaluatePlainCondition(
  //   context: any,
  //   condition: PlainCondition,
  // ): boolean | PromiseLike<boolean> {
  //   switch (condition.operator as ComparisonOp) {
  //     case '>':
  //       return context[condition.field] > condition.value;
  //     case '<':
  //       return context[condition.field] < condition.value;
  //     case '=':
  //       return context[condition.field] === condition.value;
  //     case '!=':
  //       return context[condition.field] !== condition.value;
  //     case '>=':
  //       return context[condition.field] >= condition.value;
  //     case '<=':
  //       return context[condition.field] <= condition.value;
  //     case 'contains':
  //       return (
  //         context[condition.field] &&
  //         context[condition.field].includes(condition.value)
  //       );
  //     case 'not_contains':
  //       return (
  //         context[condition.field] &&
  //         !context[condition.field].includes(condition.value)
  //       );
  //     default:
  //       throw new Error(`Unsupported operator: ${condition.operator}`);
  //   }
  // }

  // evaluateLogicalRule(
  //   condition: any,
  //   context: any,
  // ): boolean | PromiseLike<boolean> {
  //   if (condition.and) {
  //     return condition.and.every((cond: any) =>
  //       this.evaluateCondition(cond, context),
  //     );
  //   } else if (condition.or) {
  //     return condition.or.some((cond: any) =>
  //       this.evaluateCondition(cond, context),
  //     );
  //   } else if (condition.not) {
  //     return !this.evaluateCondition(condition.not[0], context);
  //   }
  //   return false;
  // }

  // private async evaluateRule(rule: Rule, context: any): Promise<boolean> {
  //   return evaluateConditionTree(rule.when, context);
  // }
}
