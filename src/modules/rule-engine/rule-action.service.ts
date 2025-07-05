import { Injectable } from '@nestjs/common';
import { RuleAction } from './types';


@Injectable()
export class RuleActionService {
  async run(actions: RuleAction[], context: any) {
    for (const action of actions) {
      switch (action.type) {
        case 'tag':
          console.log('TAG:', action.value);
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
