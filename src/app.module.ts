import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { ItemModule } from './item/item.module';
import { IndexerModule } from './aptos/indexer.module';
import { RuleEngineModule } from './modules/rule-engine/rule-engine.module';
import { SupabaseModule } from './modules/supabase/supabase.module';
import { EmailModule } from './modules/email/email.module';
import { AlertEngineModule } from './modules/alert-engine/alert-engine.module';
import { EventsModule } from './modules/events/events.module';

@Module({
  imports: [RuleEngineModule, SupabaseModule, EmailModule, AlertEngineModule, EventsModule],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RuleEngineModule, 
    SupabaseModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'schema.gql'),
    }),
    ItemModule,
    IndexerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
