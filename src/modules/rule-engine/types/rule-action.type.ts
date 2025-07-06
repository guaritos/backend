export type RuleAction = 
| {
    type: 'tag';
    value: string[];
  }
| {
    type: 'webhook';
    url: string
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers: Record<string, string>;
    body?: string;
  }
| {
    type: 'email';
    to: string;
    subject: string;
    body: string;
    recipients?: string[];
  };