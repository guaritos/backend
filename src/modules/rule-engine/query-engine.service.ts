import { Injectable } from '@nestjs/common';
import {
  Aggregate,
  AggregateCondition,
  ComparisonOp,
  Condition,
} from './types/rule.type';
import { isArray } from 'class-validator';

@Injectable()
export class QueryEngineService {
  compile(condition: Condition): (item: any) => any[] {
    if (!condition) {
      return (item: any) => [];
    }

    return (item: any) => {
      if (Array.isArray(item)) {
        return item.map((i) => this.match(i, condition)).filter(Boolean);
      } else {
        const result = this.match(item, condition);
        return result ? result : [];
      }
    };
    // return (item: TraceResult) => {
    //   const item1 = Object.keys(item.strategy_snap_shot_items).filter(
    //     (i) => this.match(i, condition))
    //   const item2 = Object.keys(item.rank_items).filter(
    //     (i) => this.match(item.rank_items[i], condition))
    //   return [...item1, ...item2];
    // }
  }

  compileAggregate(conditions: Aggregate): (item: any) => any[] {
    if (!conditions) {
      return (item: any) => [];
    }
    return (item: any) => {
      const results = this.matchAggregate(item, conditions);
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
      } else if (part === 'key') {
        return Object.keys(current);
      } else if (part === 'value') {
        return Object.values(current);
      } else {
        current = current[part];
      }
    }
    return current;
  }

  private matchAggregate(items: any, cond: Aggregate): any[] {
    const failures: any[] = [];

    if (isArray(cond)) {
      for (const c of cond) {
        const subFailures = this.matchAggregate(items, c);
        failures.push(...subFailures);
      }
      return failures;
    }

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
          // One sub-rule passed
          return [];
        }
        groupFailures.push(...subFailures);
      }

      return groupFailures; // None passed
    }

    if ('not' in cond) {
      for (const c of cond.not) {
        const subFailures = this.matchAggregate(items, c);
        if (subFailures.length === 0) {
          failures.push({
            type: 'not',
            message: 'Expected NOT to match but condition passed',
          });
        }
      }
      return failures;
    }

    // ---------- Base aggregate condition ----------
    // This version assumes `items` is a **top-level object**, not a flat array.
    // We extract the value by path (must resolve to array of numbers)

    const extracted = this.getValueByPath(items, cond.field);
    // console.log("Extracted value for field:", cond.field, "is", extracted);
    let values: number[] = [];

    if (Array.isArray(extracted)) {
      values = extracted;
    } else if (typeof extracted === 'number') {
      values = [extracted];
    }

    if (values.length === 0) {
      return [
        {
          field: cond.field,
          op: cond.op,
          operator: cond.operator,
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
    // console.log("Condition:", cond, "Aggregate value:", agg, "Passed:", passed);
    if (passed) {
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

  private match(item: any, condition: Condition): any | null {
    if ('and' in condition) {
      const results = condition.and
        .map((c) => this.match(item, c))
        .filter(Boolean);
      return results.length === condition.and.length ? results : null;
    }

    if ('or' in condition) {
      const results = condition.or
        .map((c) => this.match(item, c))
        .filter(Boolean);
      return results.length > 0 ? results : null;
    }

    if ('not' in condition) {
      const results = condition.not
        .map((c) => this.match(item, c))
        .filter(Boolean);
      return results.length === 0 ? { not: true } : null;
    }

    switch (condition.type) {
      case 'plain': {
        const value = this.getValueByPath(item, condition.field);
        const values = Array.isArray(value) ? value : [value];

        const matched = values.filter((v) =>
          this.compare(v, condition.operator, condition.value),
        );

        if (matched.length > 0) {
          return {
            field: condition.field,
            operator: condition.operator,
            expected: condition.value,
            matched,
          };
        }

        return null;
      }

      case 'exists': {
        const exists = item.hasOwnProperty(condition.field);
        const passed = condition.operator === 'true' ? exists : !exists;

        return passed ? { field: condition.field, exists } : null;
      }

      default:
        return null;
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
        if (typeof left !== typeof right) {
          return false;
        }
        if (typeof right === 'object' && right !== null) {
          return this.deepEqual(left, right);
        }
        return left === right;
      case '!=':
      case 'ne':
        if (typeof left !== typeof right) {
          return true;
        }
        if (typeof right === 'object' && right !== null) {
          return !this.deepEqual(left, right);
        }
        return left !== right;
      case 'contains':
        if (typeof left !== typeof right) {
          return false;
        }
        if (typeof right === 'object' && right !== null) {
          return Object.entries(right).every(
            ([key, value]) => this.compare(left[key], '=', value),
          );
        }
      case 'not_contains':
        if (typeof left !== typeof right) {
          return false;
        }
        if (typeof right === 'object' && right !== null) {
          return Object.entries(right).every(
            ([key, value]) => this.compare(left[key], '!=', value),
          );
        }
        return !left.includes(right);
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }

  private deepEqual(a: any, b: any): boolean {
    return JSON.stringify(a) === JSON.stringify(b);
  }
}
