import {Module} from '@nestjs/common';
import { IndexerResolver } from './indexer.resolver';
import { IndexerService } from './indexer.service';

@Module({
    providers: [IndexerResolver,IndexerService],
})
export class IndexerModule{}