import { Injectable } from '@nestjs/common';
import { RuleAction } from './types';
import { RuleService } from './rule.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class RuleActionService {
  constructor(
    private readonly service: RuleService,
    private readonly emailService: EmailService,
  ) {}

  async run(
    actions: RuleAction[],
    ruleId: string,
    context: any,
  ): Promise<void> {
    for (const action of actions) {
      switch (action.type) {
        case 'tag':
          break;
        case 'webhook':
          console.log(
            'WEBHOOK:',
            action.url,
            action.method,
            action.params?.headers,
            action.params?.body,
          );

          try {
            const res = await fetch(action.url, {
              method: action.method || 'POST',
              headers: action.params?.headers || {},
              body: action.params?.body,
            });
            const resBody = await res.text();
            console.log(
              `[Webhook] Sent to ${action.url}, status: ${res.status}`,
              resBody,
            );
          } catch (error) {
            console.error(`[Webhook] Failed to send to ${action.url}:`, error);
          }
          break;
        case 'email':
          console.log('EMAIL:', action.to, action.subject, action.body);
          try {
            await this.emailService.sendEmail(
              action.to,
              action.subject,
              action.body,
            );
            console.log(`Email sent to ${action.to}`);
          } catch (error) {
            console.error(`Failed to send email to ${action.to}:`, error);
          }
          break;
      }
    }
  }

  async sendTemplateWebhook(): Promise<void> {
    // This method is a placeholder for sending a webhook with a template.
    // Implement the logic to send a webhook with a template here.
    console.log('Sending template webhook...');
  }
}
