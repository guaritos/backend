import { Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { AlertEngineService } from './alert-engine.service';

@Controller('alert-engine')
export class AlertEngineController {
  constructor(private readonly alertEngineService: AlertEngineService) {}

  @Get("/alerts")
  async getAlerts() {
    return await this.alertEngineService.getAlerts();
  }

  @Get("/alerts/:id")
  async getAlertById(id: string) {
    return await this.alertEngineService.getAlertById(id);
  }

  @Get("/alerts/user/:userId")
  async getAlertsByUserId(@Param("userId") userId: string) {
    return await this.alertEngineService.getAlertByUserId(userId);
  }

  @Get("/alerts/rule/:ruleId")
  async getAlertsByRuleId(@Param("ruleId") ruleId: string) {
    return await this.alertEngineService.getAlertsByRuleId(ruleId);
  }

  @Put("/alerts")
  async updateAlert(@Param("id") id: string, alert: any) {
    return await this.alertEngineService.updateAlert(id, alert);
  }

  @Delete("/alerts/:id")
  async deleteAlert(@Param("id") id: string) {
    return await this.alertEngineService.deleteAlert(id);
  }
}
