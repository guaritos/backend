import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

export const EmailProvider = {
  provide: 'EMAIL_TRANSPORTER',
  useFactory: async (configService: ConfigService) => {
    const emailConfig = configService.get('email');
    return nodemailer.createTransport({
      host: emailConfig.host,
      port: emailConfig.port,
      secure: emailConfig.secure,
      auth: emailConfig.auth,
    });
  },
  inject: [ConfigService],
}
