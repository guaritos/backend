import { Injectable } from '@nestjs/common';
import { AggregateCondition, ComparisonOp, Condition } from './types/rule.type';

@Injectable()
export class QueryEngineService {
  compile(condition: Condition): (items: any[]) => any[] {
    return (items: any[]) => items.filter(item => this.match(item, condition));
  }

  matchAggregate(items: any[], cond: AggregateCondition): boolean {
    const values = items.map(i => i[cond.field]).filter(v => typeof v === 'number');
    if (values.length === 0) return false;

    const agg = (() => {
      switch (cond.op) {
        case 'sum': return values.reduce((a, b) => a + b, 0);
        case 'count': return values.length;
        case 'avg': return values.reduce((a, b) => a + b, 0) / values.length;
        case 'min': return Math.min(...values);
        case 'max': return Math.max(...values);
      }
    })();

    return this.compare(agg, cond.operator, cond.value);
  }

  private match(item: any, condition: Condition): boolean {
    if ('and' in condition) return condition.and.every(c => this.match(item, c));
    if ('or' in condition) return condition.or.some(c => this.match(item, c));
    if ('not' in condition) return condition.not.every(c => !this.match(item, c));

    switch (condition.type) {
      case 'plain':
        return this.compare(item[condition.field], condition.operator, condition.value);
      case 'exists':
        const exists = item.hasOwnProperty(condition.field);
        return condition.operator === 'true' ? exists : !exists;
      default:
        return false;
    }
  }

  private compare(left: any, operator: ComparisonOp, right: any): boolean {
    switch (operator) {
      case '>': return left > right;
      case '>=': return left >= right;
      case '<': return left < right;
      case '<=': return left <= right;
      case '=': return left === right;
      case '!=': return left !== right;
      case 'contains': return Array.isArray(left) && left.includes(right);
      case 'not_contains': return Array.isArray(left) && !left.includes(right);
      default: return false;
    }
  }
}
