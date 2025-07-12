import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class FungibleAssetMetadata {
  @Field({ nullable: true })
  icon_uri?: string;

  @Field({ nullable: true })
  project_uri?: string;

  @Field()
  symbol: string;

  @Field()
  name: string;
}

@ObjectType()
export class FungibleAssetActivity {
  @Field()
  amount: number;

  @Field()
  asset_type: string;

  @Field()
  entry_function_id_str: string;

  @Field()
  event_index: number;

  @Field()
  is_gas_fee: boolean;

  @Field()
  is_transaction_success: boolean;

  @Field()
  type: string;

  @Field()
  owner_address: string;

  @Field(() => FungibleAssetMetadata)
  metadata: FungibleAssetMetadata;
}

@ObjectType()
export class UserTransaction {
  @Field()
  entry_function_contract_address: string;

  @Field()
  entry_function_function_name: string;

  @Field() version: number;
  @Field() timestamp: string;
  @Field() sender: string;
  @Field() entry_function_id_str: string;
  @Field() entry_function_module_name: string;

}