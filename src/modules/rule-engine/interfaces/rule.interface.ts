import { RuleAction } from '../types';
import { AggregateCondition, Condition } from '../types/rule.type';

export interface Rule {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  source: string;
  interval: string;
  when: Condition;
  aggregate?: AggregateCondition;
  then: RuleAction[];
  tags?: string[];
  enabled?: boolean;
}
