import { ObjectType, Field } from '@nestjs/graphql';
import { FungibleAssetActivity, UserTransaction } from './fungible-asset.entity';


@ObjectType()
export class AssetMetadata {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  symbol?: string;

  @Field({ nullable: true })
  decimals?: number;

  @Field({ nullable: true })
  icon_uri?: string;
}

@ObjectType()
export class AccountTransaction {
  @Field()
  account_address: string;

  @Field(() => [FungibleAssetActivity])
  fungible_asset_activities: FungibleAssetActivity[];

  @Field(() => UserTransaction)
  user_transaction: UserTransaction;
}

@ObjectType()
export class AccountBalance {
  @Field()
  amount: string;

  @Field()
  asset_type: string;

  @Field(() => AssetMetadata)
  metadata: AssetMetadata;
}

@ObjectType()
export class UserTransactionDetails {
  @Field()
  timestamp: string;

  @Field()
  entry_function_id_str: string;

  @Field()
  gas_used: string;

  @Field()
  success: boolean;
}

@ObjectType()
export class TransactionHistoryItem {
  @Field()
  transaction_version: string;

  @Field()
  account_address: string;

  @Field(() => UserTransactionDetails)
  user_transaction: UserTransactionDetails;
}
