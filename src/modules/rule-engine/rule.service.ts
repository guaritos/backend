import { Inject, Injectable } from '@nestjs/common';
import { Rule } from './interfaces';
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
    return data || null;
  }

  async createRule(rule: Rule): Promise<Rule> {
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

  async updateRule(id: string, rule: Partial<Rule>): Promise<Rule> {
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

  async loadRules(): Promise<Rule[]> {
    const file = fs.readFileSync(
      'src/modules/rule-engine/rules/rules.yaml',
      'utf8',
    );
    const parsed = yaml.parse(file);
    return parsed;
  }

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
