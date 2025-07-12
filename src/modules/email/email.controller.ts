import { Controller, Get } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
    constructor(
        private readonly emailService: EmailService,
    ) {}

    @Get('test')
    async testEmail() {
        const to = ["lyhongduc.34@gmail.com"]
        const subject = "Test Email from NestJS";
        const html = "<h1>Hello from NestJS!</h1><p>This is a test email.</p>";
        for (const recipient of to) {
            try {
                await this.emailService.sendEmail(recipient, subject, html);
                console.log(`Email sent to ${recipient}`);
            } catch (error) {
                console.error(`Failed to send email to ${recipient}:`, error);
            }
        }
    }
}
