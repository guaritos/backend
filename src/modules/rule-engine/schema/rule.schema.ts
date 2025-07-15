import { z } from 'zod';

// Operators
export const ComparisonOp = z.enum([
  '>=',
  '<=',
  '>',
  '<',
  '=',
  '!=',
  'gte',
  'lte',
  'gt',
  'lt',
  'eq',
  'ne',
  'contains',
  'not_contains',
]);
export const AggregateOp = z.enum(['sum', 'count', 'avg', 'min', 'max']);
export const ExistenceOp = z.enum(['true', 'false']);

// Conditions
const PlainCondition = z.object({
  type: z.literal('plain'),
  field: z.string(),
  operator: ComparisonOp,
  value: z.union([z.string(), z.number(), z.boolean()]),
});

const ExistsCondition = z.object({
  type: z.literal('exists'),
  field: z.string(),
  operator: ExistenceOp,
});

const AggregateCondition = z.object({
  type: z.literal('aggregate'),
  field: z.string(),
  op: AggregateOp,
  operator: ComparisonOp,
  value: z.number(),
});

const LogicalRule: z.ZodType<any> = z.lazy(() =>
  z.union([
    z.object({ and: z.array(Condition) }),
    z.object({ or: z.array(Condition) }),
    z.object({ not: z.array(Condition) }),
  ]),
);

const LogicalAggregateCondition: z.ZodType<any> = z.lazy(() =>
  z.union([
    z.object({ and: z.array(AggregateCondition) }),
    z.object({ or: z.array(AggregateCondition) }),
    z.object({ not: z.array(AggregateCondition) }),
  ]),
);

export const Condition = z.union([
  PlainCondition,
  ExistsCondition,
  LogicalRule,
]);

export const Aggregate = z.union([
  AggregateCondition,
  LogicalAggregateCondition,
]);

// Actions
const TagAction = z.object({
  type: z.literal('tag'),
  value: z.string(),
});

const NotifyAction = z.object({
  type: z.literal('notify'),
  message: z.string(),
});

const WebhookAction = z.object({
  type: z.literal('webhook'),
  group: z.string(),
  params: z.object({
    headers: z.record(z.string(), z.string()),
    body: z.string(),
  }),
});

const MailAction = z.object({
  type: z.literal('mail'),
  to: z.string().optional(),
  subject: z.string().optional(),
  body: z.string(),
});

export const RuleAction = z.union([
  TagAction,
  NotifyAction,
  WebhookAction,
  MailAction,
]);

// Full Rule Schema
export const RuleSchema = z
  .object({
    id: z.string(),
    userId: z.string().optional(),
    name: z.string(),
    description: z.string().optional(),
    interval: z.string(),
    when: Condition.optional(),
    aggregate: Aggregate.optional(),
    then: z.array(RuleAction),
    tags: z.array(z.string()).optional(),
    enabled: z.boolean().optional(),
  })
  .refine(
    (rule) => {
      return rule.when || rule.aggregate;
    },
    {
      message: "Either 'when' or 'aggregate' must be defined in the rule.",
    },
  );

export type Rule = z.infer<typeof RuleSchema>;
