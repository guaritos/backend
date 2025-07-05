export type RuleAction = 
| {
    type: 'tag';
    value: string[];
  }
| {
    type: 'notify';
    message: string;
  }
| {
    type: 'email';
    to: string;
    subject: string;
    body: string;
    recipients?: string[];
  };