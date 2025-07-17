import ms from 'ms';
import cronValidate from 'cron-validate';

export function validateCron(input: string): string {
  const cron = cronValidate(input, { preset: 'default' });
  if (!cron.isValid()) throw new Error(`Invalid cron expression: ${input}`);
  return input;
}