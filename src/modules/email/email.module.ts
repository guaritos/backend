import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmailProvider } from './email.provider';

@Module({
  providers: [EmailService, EmailProvider],
  exports: [EmailService],
  controllers: [EmailController],
})
export class EmailModule {}
