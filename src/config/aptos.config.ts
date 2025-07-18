import { registerAs } from '@nestjs/config';

export default registerAs('APTOS_NETWORK', () => ({
    APTOS_NETWORK: process.env.APTOS_NETWORK || 'mainnet',
}));