import { RuleAction } from '../types';
import { AggregateCondition, Condition } from '../types/rule.type';

export interface Rule {
  id: string;
  userId: string;
  name: string;
  description?: string;
  interval: string;
  when: Condition;
  aggregate?: AggregateCondition;
  then: RuleAction[];
  tags?: string[];
  enabled?: boolean;
}
