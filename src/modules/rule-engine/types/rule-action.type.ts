export type RuleAction =
  | {
      type: 'tag';
      value: string[];
    }
  | {
      type: 'webhook';
      id: string;
      group?: string;
      url: string;
      method?: 'POST' | 'GET' | 'PUT' | 'DELETE';
      params: {
        headers?: Record<string, string>;
        body?: string; 
      };
    }
  | {
      type: 'email';
      id: string;
      to: string;
      subject: string;
      body: string;
    };
