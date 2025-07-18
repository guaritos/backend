import { registerAs } from '@nestjs/config';
import { config } from 'dotenv';

export default registerAs('contract', () => ({
  GUARITOS_CONTRACT_ADDRESS:
    process.env.GUARITOS_CONTRACT_ADDRESS || '0x1234567890abcdef',
}));
