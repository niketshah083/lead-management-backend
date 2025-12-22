import { registerAs } from '@nestjs/config';

export default registerAs('whatsapp', () => ({
  phoneNumberId: process.env.WA_PHONE_NUMBER_ID,
  accessToken: process.env.CLOUD_API_ACCESS_TOKEN,
  version: process.env.CLOUD_API_VERSION,
}));
