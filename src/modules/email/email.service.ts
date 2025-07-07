import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { config } from 'dotenv';

config();

@Injectable()
export class EmailService {
  private resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const { data, error } = await this.resend.emails.send({
      from: 'onboarding@resend.dev',
      to: to,
      subject: subject,
      html: html,
    });
    if (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }
}
