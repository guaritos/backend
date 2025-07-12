import { Inject, Injectable } from '@nestjs/common';
import { CreateRuleDTO, UpdateRuleDTO } from './dtos';
import { Rule } from './interfaces/rule.interfaces';
import * as fs from 'fs';
import * as yaml from 'yaml';
import { SupabaseClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse';

@Injectable()
export class RuleService {
  constructor(
    @Inject('supabaseClient')
    private readonly supabase: SupabaseClient,
  ) {}

  async getRules(): Promise<Rule[]> {
    const { data, error } = await this.supabase.from('rules').select('*');
    if (error) {
      console.error('Error fetching rules from Supabase:', error);
      throw new Error('Failed to fetch rules');
    }
    return data;
  }

  async getRulesByUserId(userId: string): Promise<Rule[]> {
    const { data, error } = await this.supabase
      .from('rules')
      .select('*')
      .eq('user_id', userId);
    if (error) {
      console.error('Error fetching rules by user ID from Supabase:', error);
      throw new Error('Failed to fetch rules by user ID');
    }
    return data;
  }

  async getRuleById(id: string): Promise<Rule | null> {
    const { data, error } = await this.supabase
      .from('rules')
      .select('*')
      .eq('id', id)
      .single();
    if (error) {
      console.error('Error fetching rule by ID from Supabase:', error);
      throw new Error('Failed to fetch rule by ID');
    }
    return data || null;
  }

  async createRule(rule: CreateRuleDTO): Promise<Rule> {
    console.log('Creating rule:', rule);
    const { data, error } = await this.supabase
      .from('rules')
      .insert(rule)
      .select();
    if (error) {
      console.error('Error creating rule in Supabase:', error);
      throw new Error('Failed to create rule');
    }
    return data[0];
  }

  async updateRule(id: string, rule: UpdateRuleDTO): Promise<Rule> {
    const { data, error } = await this.supabase
      .from('rules')
      .update(rule)
      .eq('id', id)
      .select();
    if (error) {
      console.error('Error updating rule in Supabase:', error);
      throw new Error('Failed to update rule');
    }
    return data[0];
  }

  async deleteRule(id: string): Promise<void> {
    const { error } = await this.supabase.from('rules').delete().eq('id', id);
    if (error) {
      console.error('Error deleting rule in Supabase:', error);
      throw new Error('Failed to delete rule');
    }
  }

  async deleteAllRules(): Promise<void> {
    const { error } = await this.supabase.from('rules').delete();
    if (error) {
      console.error('Error deleting all rules in Supabase:', error);
      throw new Error('Failed to delete all rules');
    }
  }

  async loadRules(): Promise<CreateRuleDTO[]> {
    const file = fs.readFileSync(
      'src/modules/rule-engine/rules/rules.yaml',
      'utf8',
    );
    const parsed = yaml.parse(file);
    return parsed;
  }

  // TODO: Implement a method to return the rule's data source

  async loadData(): Promise<any[]> {
    const rows: any[] = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream('src/modules/rule-engine/rules/data.csv')
        .pipe(parse({ columns: true }))
        .on('data', (row) => {
          rows.push(row);
        })
        .on('end', () => {
          console.log('CSV file successfully processed');
          resolve(null);
        })
        .on('error', (error) => {
          console.error('Error processing CSV file:', error);
          reject(error);
        });
    });
    return rows;
  }
}
