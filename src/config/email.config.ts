import { registerAs } from '@nestjs/config';
import { config } from 'dotenv';

export default registerAs('email', () => ({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: process.env.EMAIL_SECURE === 'true', 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  from: process.env.EMAIL_FROM || '"No Reply" <guaritos.noreply@example.com>',
}));
