import { InputType, Field, Int } from '@nestjs/graphql';
import { IsOptional, IsNumber, IsString, Min } from 'class-validator';

@InputType()
export class QueryOptionsInput {
  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;

  @Field({ nullable: true, description: 'Order by field' })
  @IsOptional()
  @IsString()
  orderBy?: string;
}