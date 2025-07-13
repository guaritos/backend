import { Inject, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { Alert } from './interfaces';

@Injectable()
export class AlertEngineService {
  constructor(
    @Inject('supabaseClient')
    private readonly supabase: SupabaseClient,
  ) {}

  async createAlert(alert: Alert): Promise<Alert> {
    const { data, error } = await this.supabase
      .from('alerts')
      .insert(alert)
      .select();
    if (error) {
      console.error('Error creating alert in Supabase:', error);
      throw new Error('Failed to create alert');
    }
    return data[0];
  }

  async getAlerts(): Promise<Alert[]> {
    const { data, error } = await this.supabase
      .from('alerts')
      .select(`*, rules(*)`)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching alerts from Supabase:', error);
      throw new Error('Failed to fetch alerts');
    }
    return data;
  }

  async getAlertById(id: string): Promise<Alert> {
    const { data, error } = await this.supabase
      .from('alerts')
      .select(`*, rules(*)`)
      .eq('id', id)
      .maybeSingle();
    if (error) {
      console.error('Error fetching alert by ID from Supabase:', error);
      throw new Error('Failed to fetch alert by ID');
    }
    return data;
  }

  async getAlertsByRuleId(ruleId: string): Promise<Alert[]> {
    const { data, error } = await this.supabase
      .from('alerts')
      .select(`*, rules(*)`)
      .eq('rule_id', ruleId);
    if (error) {
      console.error('Error fetching alerts by rule ID from Supabase:', error);
      throw new Error('Failed to fetch alerts by rule ID');
    }
    return data;
  }

  async getAlertByUserId(userId: string): Promise<Alert[]> {
    const { data, error } = await this.supabase
      .from('alerts')
      .select(`*, rules(*)`)
      .eq('rules.user_id', userId);
    if (error) {
      console.error('Error fetching alerts by user ID from Supabase:', error);
      throw new Error('Failed to fetch alerts by user ID');
    }
    return data;
  }

  async updateAlert(id: string, alert: Partial<Alert>): Promise<Alert> {
    const { data, error } = await this.supabase
      .from('alerts')
      .update(alert)
      .eq('id', id)
      .select();
    if (error) {
      console.error('Error updating alert in Supabase:', error);
      throw new Error('Failed to update alert');
    }
    return data[0];
  }

  async deleteAlert(id: string): Promise<void> {
    const { error } = await this.supabase.from('alerts').delete().eq('id', id);
    if (error) {
      console.error('Error deleting alert in Supabase:', error);
      throw new Error('Failed to delete alert');
    }
  }
}
