import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { RuleService } from './rule.service';
import { RuleEngineService } from './rule-engine.service';
import { validateCron } from '../../helpers/validate-cron';
import cronValidate from 'cron-validate';
import { CronJob } from 'cron';
import * as fs from 'fs';
import { Rule } from './interfaces';
import { EventsGateway } from '../events/events.gateway';

@Injectable()
export class RuleSchedulerService implements OnModuleInit, OnModuleDestroy {
  private logPath = 'logs/cron.log';

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly service: RuleService,
    private readonly engine: RuleEngineService,
    private readonly eventGateway: EventsGateway,
  ) {
    if (!fs.existsSync('logs')) {
      fs.mkdirSync('logs');
    }
    if (!fs.existsSync(this.logPath)) {
      fs.writeFileSync(this.logPath, '');
    }
  }

  async onModuleInit() {
    const rules = await this.service.getRules();

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
    const ruleCron = rule.cron;
    const jobName = `rule-${rule.id}`;
  
    if (!ruleCron) {
      this.eventGateway.sendEventToUser(rule.user_id, 'alert', 'error', {
        title: `Rule "${rule.name}" has no interval set`,
        message: `Please set a valid cron expression for the rule.`,
      });
      return;
    }
    const cron = cronValidate(ruleCron, { preset: 'default', override: { useSeconds: true } })
    if (!cron.isValid()) {
      this.eventGateway.sendEventToUser(rule.user_id, 'alert', 'error', {
        title: `Invalid cron expression for rule "${rule.name}"`,
        message: `The cron expression "${ruleCron}" is not valid. Please correct it.`,
        error: cron.getError(),
      });
    }

    // try {
    //   console.warn(`Rule ${rule.id} has an invalid cron expression: ${cron} skipping scheduling.`);
    //   validateCron(cron);
    // } catch (error) {
    //   this.eventGateway.sendEventToUser(rule.user_id, 'alert', 'error', {
    //     title: `Invalid cron expression for rule "${rule.name}"`,
    //     message: `The cron expression "${cron}" is not valid. Please correct it.`,
    //     error: error.message,
    //   });
    //   return;
    // }

    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      this.schedulerRegistry.deleteCronJob(jobName);
    }
    
    if (!rule.enabled) {
      console.warn(`Rule ${rule.id} is disabled, skipping scheduling.`);
      return;
    }
    if (rule.is_template) {
      console.warn(`Rule ${rule.id} is a template, skipping scheduling.`);
      return;
    }
    this.service.updateRuleStatus(rule.id, 'running');

    // TODO: load the source data for the rule
    const job = new CronJob(ruleCron, async () => {
      fs.appendFile(
        this.logPath,
        `[${new Date().toLocaleString()}][CRON][INFO]Executing rule: (${rule.id}) (${rule.user_id}) ${rule.name}\n`,
        (err) => {
          if (err) {
            console.error(`Failed to write to log file: ${err.message}`);
          }
        },
      );
      try {
        await this.engine.runRule(rule);
      } catch (error) {
        console.error(`[CRON][ERROR]Failed to execute rule: ${rule.id} - ${error.message}`);
        fs.appendFile(
          this.logPath,
          `[${new Date().toLocaleString()}][CRON][ERROR]Failed to execute: (${rule.id}) (${rule.user_id}) ${rule.name}\n
          Error: ${error.message}\n`,
          (err) => {
            if (err) {
              console.error(`Failed to write to log file: ${err.message}`);
            }
          },
        );
        this.removeRule(rule.id);
      }
    });

    this.schedulerRegistry.addCronJob(jobName, job);
    job.start();
  }

  async removeRule(ruleId: string): Promise<void> {
    const jobName = `rule-${ruleId}`;
    if (this.schedulerRegistry.doesExist('cron', jobName)) {
      this.schedulerRegistry.deleteCronJob(jobName);
      this.service.updateRuleStatus(ruleId, 'stopped');
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
