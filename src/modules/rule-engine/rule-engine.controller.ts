import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
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

  @Post('rule')
  async createRule(@Body() ruleData: any) {
    const rule = await this.ruleService.createRule(ruleData);
    this.scheduleService.registerCron(rule);
    return rule;
  }

  @Put('rule/:id')
  async updateRule(
    @Param('id') ruleId: string,
    @Body() ruleData: any,
  ) {
    try {
      const updatedRule = await this.ruleService.updateRule(ruleId, ruleData);
      this.scheduleService.registerCron(updatedRule);
      return updatedRule;
    } catch (error) {
      console.error('Error updating rule:', error);
      throw new Error(
        `Failed to update rule with ID ${ruleId}: ${error.message}`,
      );
    }
  }

  @Delete('rule/:id')
  async deleteRule(@Param('id') ruleId: string) {
    try {
      await this.ruleService.deleteRule(ruleId);
      this.scheduleService.removeRule(ruleId);
    } catch (error) {
      console.error('Error deleting rule:', error);
      throw new Error(
        `Failed to delete rule with ID ${ruleId}: ${error.message}`,
      );
    }
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
