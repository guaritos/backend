import { Injectable } from '@nestjs/common';
import { RuleAction } from './types';
import { RuleService } from './rule.service';


@Injectable()
export class RuleActionService {
  constructor(
    private readonly service: RuleService,
  ) {}

  async run(actions: RuleAction[], ruleId: string): Promise<void> {
    for (const action of actions) {
      switch (action.type) {
        case 'tag':
          break;
        case 'notify':
          console.log('NOTIFY:', action.type);
          break;
        case 'email':
          console.log('EMAIL:', action.to, action.subject, action.body);
          break;
      }
    }
  }
}
