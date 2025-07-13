import { Module } from '@nestjs/common';
import { TracerEngineService } from './tracer-engine.service';
import { AccountTransaction, AptosModule } from '../aptos';

@Module({
  providers: [TracerEngineService],
  imports: [AptosModule],
  exports: [TracerEngineService],
})
export class TracerEngineModule {}
