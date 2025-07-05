import { Injectable } from '@nestjs/common';
import { RuleService } from './rule.service';
import { RuleActionService } from './rule-action.service';
import { Rule } from './interfaces';
import { ComparisonOp, PlainCondition } from './types/rule.type';
import { QueryEngineService } from './query-engine.service';

@Injectable()
export class RuleEngineService {
  constructor(
    private readonly loader: RuleService,
    private readonly action: RuleActionService,
    private readonly queryEngine: QueryEngineService,
  ) {}

  async execute(rule: Rule, dataset: any): Promise<any[]> {
    const { when } = rule;

    const filtered = this.queryEngine.compile(when)(dataset);
    
    const aggOk = rule.aggregate && this.queryEngine.matchAggregate(filtered, rule.aggregate);

    if (filtered.length > 0 && aggOk) {
      await this.action.run(rule.then, filtered);
    }
    
    return filtered;
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
