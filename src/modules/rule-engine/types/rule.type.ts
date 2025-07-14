export type Condition = ExistsCondition | PlainCondition | LogicalRule;

export type Aggregate = AggregateCondition | LogicalAggregateCondition;

export type AggregateCondition = {
  type: 'aggregate';
  field: string;
  op: AggregateOp;
  operator: ComparisonOp;
  value: number;
  global?: boolean;
};

export type ExistsCondition = {
  type: 'exists';
  field: string;
  operator: ExistenceOp;
};

export type PlainCondition = {
  type: 'plain';
  field: string;
  operator: ComparisonOp;
  value: string | number | boolean; // flexible for plain
};

export type AggregateOp = 'sum' | 'count' | 'avg' | 'min' | 'max';
export type ComparisonOp =
  | '>=' | '<=' | '>' | '<' | '=' | '!='
  | 'gte'| 'lte'| 'gt'| 'lt'| 'eq'| 'ne'
  | 'contains'
  | 'not_contains'
  | 'in';
  
export type ExistenceOp = 'true' | 'false';

type LogicalRule =
  | { and: Condition[] }
  | { or: Condition[] }
  | { not: Condition[] };

type LogicalAggregateCondition =
  | { and: AggregateCondition[] }
  | { or: AggregateCondition[] }
  | { not: AggregateCondition[] };
