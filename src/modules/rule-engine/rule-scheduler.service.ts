import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { RuleService } from './rule.service';
import { RuleEngineService } from './rule-engine.service';
import { validateCron } from 'src/helpers/interval-time';
import { CronJob } from 'cron';
import * as fs from 'fs';
import { Rule } from './interfaces';

@Injectable()
export class RuleSchedulerService implements OnModuleInit, OnModuleDestroy {
  private logPath = 'logs/cron.log';

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly loader: RuleService,
    private readonly engine: RuleEngineService,
  ) {
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
    if (!fs.existsSync(this.logPath)) {
      fs.writeFileSync(this.logPath, '');
    }
  }

  async onModuleInit() {
    const rules = await this.loader.getRules();

    for (const rule of rules) {
      this.registerCron(rule);
      console.log(`Scheduled rule: ${rule.name} with ID: ${rule.id}`);
    }
  }

  async onModuleDestroy() {
    const jobNames = this.schedulerRegistry.getCronJobs();
    for (const [name, job] of jobNames) {
      if (name.startsWith('rule-')) {
        job.stop();
        this.schedulerRegistry.deleteCronJob(name);
        console.log(`Stopped and removed scheduled rule: ${name}`);
      }
    }
  }

  registerCron(rule: Rule) {
    const cron = rule.interval;
    const jobName = `rule-${rule.id}`;

    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      this.schedulerRegistry.deleteCronJob(jobName);
    }
    if (!rule.enabled) {
      console.warn(`Rule ${rule.id} is disabled, skipping scheduling.`);
      return;
    }

    // TODO: load the source data for the rule
    const job = new CronJob(cron, async () => {
      fs.appendFileSync(
        this.logPath,
        `[${new Date().toLocaleString()}][CRON] Executing rule: (${rule.id}) (${rule.user_id}) ${rule.name}\n`,
      );
      await this.engine.execute(rule, []);
    });

    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();
  }

  async removeRule(ruleId: string): Promise<void> {
    const jobName = `rule-${ruleId}`;
    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      this.schedulerRegistry.deleteCronJob(jobName);
      console.log(`Stopped rule: ${ruleId}`);
    } else {
      console.warn(`No job found for rule: ${ruleId}`);
    }
  }

  async listSheduledRuleIds(): Promise<string[]> {
    const jobNames = this.schedulerRegistry.getCronJobs();
    return Array.from(jobNames.keys())
      .filter((name) => name.startsWith('rule-'))
      .map((name) => name.replace('rule-', ''));
  }
}
