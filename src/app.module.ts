import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ItemModule } from './modules/item/item.module';
import { AptosModule } from './modules/aptos/aptos.module';
import { RuleEngineModule } from './modules/rule-engine/rule-engine.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { EmailModule } from './modules/email/email.module';
import { AlertEngineModule } from './modules/alert-engine/alert-engine.module';
import { EventsModule } from './modules/events/events.module';
import { Aptos } from '@aptos-labs/ts-sdk';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RuleEngineModule, 
    SupabaseModule,
    EmailModule,
    AlertEngineModule,
    EventsModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
    }),
    ItemModule,
    AptosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
