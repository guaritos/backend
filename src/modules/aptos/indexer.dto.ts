import { Field, ObjectType, Int } from '@nestjs/graphql';

@ObjectType()
export class AccountDataDto {
  @Field()
  authenticationKey: string;

  @Field()
  sequenceNumber: string;
}