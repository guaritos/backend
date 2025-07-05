import { Inject, Injectable } from '@nestjs/common';
import { Rule } from './interfaces';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { Supabase } from '../supabase/supabase';

@Injectable()
export class RuleService {
  constructor(
    @Inject('Supabase') // Ensure Supabase is provided correctly
    private readonly supabase: Supabase
  ) {}

  async getRules(): Promise<Rule[]> {
    const { data, error } = await this.supabase.getClient().from('rules').select('*');
    if (error) {
      console.error('Error fetching rules from Supabase:', error);
      throw new Error('Failed to fetch rules');
    }
    return data;
  }

  async getRulesByUserId(userId: string): Promise<Rule[]> {
    const { data, error } = await this.supabase.getClient().from('rules').select('*').eq('user_id', userId);
    if (error) {
      console.error('Error fetching rules by user ID from Supabase:', error);
      throw new Error('Failed to fetch rules by user ID');
    }
    return data;
  }

  async getRuleById(id: string): Promise<Rule | null> {
    const { data, error } = await this.supabase.getClient().from('rules').select('*').eq('id', id).single();
    return data || null;
  }

  async createRule(rule: Rule): Promise<Rule> {
    const { data, error } = await this.supabase.getClient().from('rules').insert(rule).select();
    if (error) {
      console.error('Error creating rule in Supabase:', error);
      throw new Error('Failed to create rule');
    }
    return data[0];
  }

  async loadRules(): Promise<Rule[]> {
    const file = fs.readFileSync('src/modules/rule-engine/rules/rules.yaml', 'utf8');
    const parsed = yaml.parse(file);
    return parsed;
  }
}
