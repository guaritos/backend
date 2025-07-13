import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  constructor(
    @Inject('EMAIL_TRANSPORTER')
    private readonly transporter: nodemailer.Transporter,
    private readonly configService: ConfigService,
  ) {}

  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    const from = this.configService.get<string>('email.from');
    await this.transporter.sendMail({
      from,
      to,
      subject,
      html: body,
    }, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
      }
    });
  }
}
