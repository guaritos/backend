import { InputType, Field, Int } from '@nestjs/graphql';
import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';

@InputType()
export class AccountTransactionFiltersInput {
  @Field({ nullable: true, description: 'Transaction version' })
  @IsOptional()
  @IsString()
  transaction_version?: string;

  @Field({ nullable: true, description: 'Account address' })
  @IsOptional()
  @IsString()
  account_address?: string;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}

@InputType()
export class GetAccountTransactionsByVersionInput {
  @Field({ description: 'Transaction version' })
  @IsString()
  transaction_version: string;

  @Field({ description: 'Account address' })
  @IsString()
  account_address: string;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;
}

@InputType()
export class GetAccountTransactionsByAddressInput {
  @Field({ description: 'Account address' })
  @IsString()
  account_address: string;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  offset?: number;
}