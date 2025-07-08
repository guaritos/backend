import {Resolver, Query} from '@nestjs/graphql';

@Resolver('Item')
export class ItemResolver {
  @Query(() => String)
  async getItem(): Promise<string> {
    return 'This is an item';
  }
}