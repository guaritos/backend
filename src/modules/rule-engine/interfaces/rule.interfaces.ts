import { RuleAction } from "../types";
import { Condition, Aggregate } from "../types/rule.type";

export interface Rule {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  source: string;
  cron: string;
  when?: Condition;
  aggregate?: Aggregate;
  then: RuleAction[];
  tags?: string[];
  enabled?: boolean;
  is_template?: boolean;
  in_owner_blacklist?: boolean;
  in_community_blacklist?: boolean;
}
