import { RuleAction } from "../types";
import { Condition, Aggregate } from "../types/rule.type";

export interface Rule {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  source: string;
  interval: string;
  when?: Condition;
  aggregate?: Aggregate;
  then: RuleAction[];
  tags?: string[];
  enabled?: boolean;
}
