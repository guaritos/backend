import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class DaoBlacklist {
  @Field({nullable: true})
  owner_address?: string;

  @Field(() => [String], {nullable: true})
  address?: string[];

  @Field({nullable: true})
  token_address?: string;
}