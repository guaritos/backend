import { ApiProperty, ApiExtraModels } from '@nestjs/swagger';
import { RuleAction } from '../types';
import { Aggregate, AggregateCondition, Condition } from '../types/rule.type';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AtLeastOneOf } from '../../../validators/at-least-one-of.validator';

@AtLeastOneOf(['when', 'aggregate'], {
  message: 'Either "when" or "aggregate" must be provided',
})
export class CreateRuleDTO {
  @ApiProperty({
    description: 'Name of the rule',
    example: 'Daily Sales Report',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Description of the rule',
    example: 'Generates a report of daily sales.',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Source of the rule, e.g., a file path or URL',
    example: 'https://example.com/rules/daily_sales.yaml',
  })
  @IsString()
  @IsNotEmpty()
  source: string;

  @ApiProperty({
    description: 'Cron at which the rule should be executed',
    example: '0 0 * * *', // Cron format
  })
  @IsString()
  @IsNotEmpty()
  cron: string;

  @ApiProperty({
    type: 'object',
    required: false,
  })
  @IsOptional()
  @IsString()
  when?: Condition;

  @ApiProperty({
    type: 'object',
    required: false,
  })
  @IsOptional()
  @IsString()
  aggregate?: Aggregate;

  @ApiProperty({
    description: 'Actions to be performed when the rule conditions are met',
    type: 'object',
    isArray: true,
  })
  @IsNotEmpty()
  then: RuleAction[];

  @ApiProperty({
    description: 'Tags associated with the rule for categorization',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    description: 'Indicates whether the rule is enabled or not',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  enabled?: boolean;

  @ApiProperty({
    description: 'Indicates if the rule is a template',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  is_template?: boolean;
}


export class RuleDTO extends CreateRuleDTO {
  @ApiProperty({
    description: 'Unique identifier of the rule',
    example: 'rule_12345',
  })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'ID of the user who created the rule',
    example: 'user_67890',
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;
}


export class UpdateRuleDTO extends CreateRuleDTO {
  @ApiProperty({
    description: 'ID of the rule to be updated',
  })
  @IsString()
  @IsNotEmpty()
  id: string;
}