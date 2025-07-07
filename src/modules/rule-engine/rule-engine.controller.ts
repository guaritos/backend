import { Controller, Delete, Get, Param } from '@nestjs/common';
import { RuleEngineService } from './rule-engine.service';
import { RuleService } from './rule.service';
import { RuleSchedulerService } from './rule-scheduler.service';

@Controller('rule-engine')
export class RuleEngineController {
  constructor(
    private readonly ruleEngineService: RuleEngineService,
    private readonly ruleService: RuleService,
    private readonly scheduleService: RuleSchedulerService,
  ) {}

  @Get('test')
  async testRuleEngine() {
    const rules = await this.ruleService.loadRules();
    const data = await this.ruleService.loadData();
    let res = [];
    for (const rule of rules) {
      const ruleInsert = await this.ruleService.createRule(rule);
      console.log('Rule created:', ruleInsert);
      const result = await this.ruleEngineService.execute(rule, data);
      res.push({
        rule: ruleInsert,
        result: result,
      });
    }
    return res;
  }

  @Get('rules')
  async getRules() {
    return this.ruleService.getRules();
  }

  @Get('rules/:userId')
  async getRulesByUserId(@Param('userId') userId: string) {
    return this.ruleService.getRulesByUserId(userId);
  }

  @Get('rule/:id')
  async getRuleById(@Param('id') ruleId: string) {
    return this.ruleService.getRuleById(ruleId);
  }

  @Delete('rule/:id')
  async deleteRule(@Param('id') ruleId: string) {
    await this.ruleService.deleteRule(ruleId);
    return { message: `Rule with ID ${ruleId} deleted.` };
  }

  @Get('cron')
  async getCronRules() {
    const rules = await this.scheduleService.listSheduledRuleIds();
    return rules;
  }

  @Get('cron/:id')
  async removeRule(@Param('id') ruleId: string) {
    await this.scheduleService.removeRule(ruleId);
    return { message: `Rule with ID ${ruleId} removed from scheduler.` };
  }
}
