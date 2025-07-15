import { Injectable } from '@nestjs/common';
import {
  Aggregate,
  AggregateCondition,
  ComparisonOp,
  Condition,
} from './types/rule.type';

@Injectable()
export class QueryEngineService {
  compile(condition: Condition): (items: any[]) => any[] {
    if (!condition) {
      return (items: any[]) => items;
    }
    return (items: any[]) =>
      items.filter((item) => this.match(item, condition));
  }

  compileAggregate(conditions: Aggregate): (items: any[]) => any[] {
    if (!conditions) {
      return (items: any[]) => items;
    }
    return (items: any[]) => {
      const results = this.matchAggregate(items, conditions);
      return results.filter((r) => Object.keys(r).length > 0);
    };
  }

  getAllFields(obj: any, prefix = ''): { path: string; type: string }[] {
    if (typeof obj !== 'object' || obj === null) return [];
  
    const paths: { path: string; type: string }[] = [];
  
    for (const key of Object.keys(obj)) {
      const fullPath = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
  
      if (Array.isArray(value)) {
        const arrPath = `${fullPath}[]`;
  
        if (value.length === 0) {
          paths.push({ path: arrPath, type: 'array' });
        } else {
          const first = value[0];
  
          if (typeof first === 'object' && first !== null) {
            // Array of objects → recurse into first element
            paths.push(...this.getAllFields(first, arrPath));
          } else {
            // Array of primitive
            paths.push({ path: arrPath, type: typeof first });
          }
        }
      } else if (typeof value === 'object' && value !== null) {
        paths.push(...this.getAllFields(value, fullPath));
      } else {
        paths.push({ path: fullPath, type: typeof value });
      }
    }
  
    return paths;
  }

  getValueByPath(obj: any, path: string): any {
    if (!path) return obj;
    const parts = path.split('.');
    let current = obj;

    for (const part of parts) {
      if (!current || typeof current !== 'object') {
        return undefined; // Path not found
      }

      if (part.endsWith('[]')) {
        const arrayKey = part.slice(0, -2);
        current = current[arrayKey];

        if (!Array.isArray(current)) return undefined;

        const restPath = parts.slice(parts.indexOf(part) + 1).join('.');
        return current
          .map((item) => this.getValueByPath(item, restPath))
          .flat();
      } else {
        current = current[part];
      }
    }
    return current;
  }

  private matchAggregate(items: any[], cond: Aggregate): any[] {
    const failures: any[] = [];

    if ('and' in cond) {
      for (const c of cond.and) {
        const subFailures = this.matchAggregate(items, c);
        failures.push(...subFailures);
      }
      return failures;
    }

    if ('or' in cond) {
      const groupFailures: any[] = [];

      for (const c of cond.or) {
        const subFailures = this.matchAggregate(items, c);
        if (subFailures.length === 0) {
          // one sub-rule passed -> return no failure
          return [];
        }
        groupFailures.push(...subFailures);
      }

      // none passed
      return groupFailures;
    }

    if ('not' in cond) {
      for (const c of cond.not) {
        const subFailures = this.matchAggregate(items, c);
        if (subFailures.length === 0) {
          // if any condition matched, not fails
          failures.push({
            type: 'not',
            message: 'Expected NOT to match but condition passed',
          });
        }
      }
      return failures;
    }

    // ----- Base aggregate condition -----
    const values = items
      .map((i) => this.getValueByPath(i, cond.field))
      .filter((v) => typeof v === 'number');

    if (values.length === 0) {
      return [
        {
          field: cond.field,
          op: cond.op,
          error: 'No numeric values',
        },
      ];
    }

    const agg = (() => {
      switch (cond.op) {
        case 'sum':
          return values.reduce((a, b) => a + b, 0);
        case 'count':
          return values.length;
        case 'avg':
          return values.reduce((a, b) => a + b, 0) / values.length;
        case 'min':
          return Math.min(...values);
        case 'max':
          return Math.max(...values);
        default:
          return NaN;
      }
    })();

    const passed = this.compare(agg, cond.operator, cond.value);

    if (!passed) {
      return [
        {
          field: cond.field,
          op: cond.op,
          operator: cond.operator,
          expected: cond.value,
          actual: agg,
        },
      ];
    }

    return [];
  }

  private match(item: any, condition: Condition): boolean {
    if ('and' in condition)
      return condition.and.every((c) => this.match(item, c));
    if ('or' in condition) return condition.or.some((c) => this.match(item, c));
    if ('not' in condition)
      return condition.not.every((c) => !this.match(item, c));

    switch (condition.type) {
      case 'plain':
        const value = this.getValueByPath(item, condition.field);
        return this.compare(value, condition.operator, condition.value);
      case 'exists':
        const exists = item.hasOwnProperty(condition.field);
        return condition.operator === 'true' ? exists : !exists;
      default:
        return false;
    }
  }

  private compare(left: any, operator: ComparisonOp, right: any): boolean {
    switch (operator) {
      case '>':
      case 'gt':
        return left > right;
      case '>=':
      case 'gte':
        return left >= right;
      case '<':
      case 'lt':
        return left < right;
      case '<=':
      case 'lte':
        return left <= right;
      case '=':
      case 'eq':
        return left === right;
      case '!=':
      case 'ne':
        return left !== right;
      case 'contains':
        return Array.isArray(left) && left.includes(right);
      case 'not_contains':
        return Array.isArray(left) && !left.includes(right);
      default:
        return false;
    }
  }
}
