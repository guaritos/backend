import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { RuleEngineService } from './rule-engine.service';
import { RuleService } from './rule.service';
import { RuleSchedulerService } from './rule-scheduler.service';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { CreateRuleDTO } from './dtos';

@Controller('rule-engine')
export class RuleEngineController {
  constructor(
    private readonly ruleEngineService: RuleEngineService,
    private readonly ruleService: RuleService,
    private readonly scheduleService: RuleSchedulerService,
  ) {}

  @ApiOperation({
    summary: 'Test Rule Engine',
    description: 'Endpoint to test the rule engine by executing rules and returning results.',
    tags: ['rule-engine'],
  })
  /**
   * Test endpoint to execute rules and return results.
   * @returns {Promise<any[]>} An array of results from executing the rules.
   */
  @Get('test')
  async testRuleEngine() {
    const rules = await this.ruleService.loadRules();
    const data = await this.ruleService.loadData();
    let res = [];
    for (const rule of rules) {
      const ruleInsert = await this.ruleService.createRule(rule);
      console.log('Rule created:', ruleInsert);
      const result = await this.ruleEngineService.runRule(ruleInsert);
      res.push({
        rule: ruleInsert,
        result: result,
      });
    }
    await this.ruleService.deleteAllRules();
    return res;
  }

  @ApiOperation({
    summary: 'Get all rules',
    description: 'Endpoint to retrieve all rules from the rule engine.',
    tags: ['rules'],
  })
  @Get('rules')
  async getRules() {
    return this.ruleService.getRules();
  }

  @ApiOperation({
    summary: 'Get rules by user ID',
    description: 'Endpoint to retrieve rules associated with a specific user ID.',
    tags: ['rules'],
  })
  @Get('rules/user/:userId')
  async getRulesByUserId(@Param('userId') userId: string) {
    return this.ruleService.getRulesByUserId(userId);
  }

  @ApiOperation({
    summary: 'Get rule by ID',
    description: 'Endpoint to retrieve a specific rule by its ID.',
    tags: ['rules'],
  })
  @Get('rules/template')
  async getRuleTemplates() {
    return this.ruleService.getRuleTemplates();
  }

  @ApiOperation({
    summary: 'Get rule by ID',
    description: 'Endpoint to retrieve a specific rule by its ID.',
    tags: ['rules'],
  })
  @Get('rules/:id')
  async getRuleById(@Param('id') ruleId: string) {
    return this.ruleService.getRuleById(ruleId);
  }

  @ApiOperation({
    summary: 'Create a new rule',
    description: 'Endpoint to create a new rule in the rule engine.',
    tags: ['rules'],
  })
  @ApiBody({
    description: `Example YAML (paste into 'yaml' field):
  \`\`\`yaml
  id: rule-ml-v1
  name: Detect Money Laundering
  source: transactions // Not decided yet, will be loaded from the rule engine, maybe account address
  interval: "1h" // Will be changed to cron later
  enabled: true
  when:
    and:
      - type: plain
        field: value
        operator: ">"
        value: 1000000
      - type: plain
        field: type
        operator: "=="
        value: "transfer"
  aggregate:
    type: aggregate
    field: value
    op: sum
    operator: ">"
    value: 1000000
  then:
    - type: tag
      value: "money-laundering"
    - type: webhook
      group: default
      params:
        headers:
          X-API-Key: secret
        body: |
          {
            "alert": "{{rule.name}}",
            "message": "{{context.message}}"
          }
  tags:
    - money-laundering
  enabled: true
  \`\`\``,
  })
  @Post('rules')
  async createRule(@Body() ruleData: CreateRuleDTO) {
    const rule = await this.ruleService.createRule(ruleData);
    if (!rule) {
      throw new Error('Failed to create rule');
    }
    // TODO: Add execute method to run the rule immediately if needed, remember to handle the source data
    this.scheduleService.registerCron(rule);
    return rule;
  }

  @ApiOperation({
    summary: 'Update an existing rule',
    description: 'Endpoint to update an existing rule by its ID.',
    tags: ['rules'],
  })
  @Put('rules/:id')
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

  @ApiOperation({
    summary: 'Delete a rule',
    description: 'Endpoint to delete a rule by its ID.',
    tags: ['rules'],
  })
  @Delete('rules/:id')
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

  @ApiOperation({
    summary: 'Get scheduled cron rules',
    description: 'Endpoint to retrieve all scheduled cron rules.',
    tags: ['crons'],
  })
  @Get('crons')
  async getCronRules() {
    const rules = await this.scheduleService.listSheduledRuleIds();
    return rules;
  }

  @ApiOperation({
    summary: 'Remove a scheduled rule',
    description: 'Endpoint to remove a scheduled rule by its ID.',
    tags: ['crons'],
  })
  @Get('crons/:id')
  async removeRule(@Param('id') ruleId: string) {
    await this.scheduleService.removeRule(ruleId);
    return { message: `Rule with ID ${ruleId} removed from scheduler.` };
  }
}
