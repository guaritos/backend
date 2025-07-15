import { Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AlertEngineService } from './alert-engine.service';
import { ApiOperation } from '@nestjs/swagger';

@Controller('alert-engine')
export class AlertEngineController {
  constructor(private readonly alertEngineService: AlertEngineService) {}

  @ApiOperation({
    summary: 'Get all alerts',
    description: 'Endpoint to retrieve all alerts from the alert engine.',
    tags: ['alerts'],
  })
  @Get("/alerts")
  async getAlerts() {
    return await this.alertEngineService.getAlerts();
  }

  @ApiOperation({
    summary: 'Create a new alert',
    description: 'Endpoint to create a new alert in the alert engine.',
    tags: ['alerts'],
  })
  @Get("/alerts/:id")
  async getAlertById(@Param('id') id: string) {
    return await this.alertEngineService.getAlertById(id);
  }

  @ApiOperation({
    summary: 'Get alerts by user ID',
    description: 'Endpoint to retrieve alerts associated with a specific user ID.',
    tags: ['alerts'],
  })
  @Get("/alerts/user/:userId")
  async getAlertsByUserId(@Param("userId") userId: string) {
    return await this.alertEngineService.getAlertByUserId(userId);
  }

  @ApiOperation({
    summary: 'Get alerts by rule ID',
    description: 'Endpoint to retrieve alerts associated with a specific rule ID.',
    tags: ['alerts'],
  })
  @Get("/alerts/rule/:ruleId")
  async getAlertsByRuleId(@Param("ruleId") ruleId: string) {
    return await this.alertEngineService.getAlertsByRuleId(ruleId);
  }

  @ApiOperation({
    summary: 'Update an alert',
    description: 'Endpoint to update an existing alert by its ID.',
    tags: ['alerts'],
  })
  @Put("/alerts")
  async updateAlert(@Param("id") id: string, alert: any) {
    return await this.alertEngineService.updateAlert(id, alert);
  }

  @ApiOperation({
    summary: 'Delete an alert',
    description: 'Endpoint to delete an alert by its ID.',
    tags: ['alerts'],
  })
  @Delete("/alerts/:id")
  async deleteAlert(@Param("id") id: string) {
    return await this.alertEngineService.deleteAlert(id);
  }
}
