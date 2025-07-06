import { Injectable } from '@nestjs/common';
import { RuleAction } from './types';
import { RuleService } from './rule.service';

@Injectable()
export class RuleActionService {
  constructor(private readonly service: RuleService) {}

  async run(actions: RuleAction[], ruleId: string): Promise<void> {
    for (const action of actions) {
      switch (action.type) {
        case 'tag':
          break;
        case 'webhook':
          console.log(
            'WEBHOOK:',
            action.url,
            action.method,
            action.headers,
            action.body,
          );
          const { url, method = 'POST', headers, body } = action;

          try {
            const res = await fetch(url, {
              method: method,
              headers: {
                'Content-Type': 'application/json',
                ...headers,
              },
              body: body && JSON.stringify(body),
            });
            const resBody = await res.text();
            console.log(
              `[Webhook] Sent to ${url}, status: ${res.status}`,
              resBody,
            );
          } catch (error) {
            console.error(`[Webhook] Failed to send to ${url}:`, error);
          }
          break;
        case 'email':
          console.log('EMAIL:', action.to, action.subject, action.body);
          break;
      }
    }
  }
}
