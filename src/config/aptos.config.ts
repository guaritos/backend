import { registerAs } from '@nestjs/config';

export default registerAs('aptos', () => ({
    APTOS_NETWORK: process.env.APTOS_NETWORK || 'mainnet',
}));