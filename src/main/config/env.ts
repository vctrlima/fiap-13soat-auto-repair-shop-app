import * as dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.SERVER_PORT || 3000,
  host: process.env.SERVER_HOST || 'http://localhost:3000',
  passwordHashSalt: Number(process.env.PASSWORD_HASH_SALT) || 10,
  jwtAccessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || '',
  jwtRefreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || '',
  mailing: {
    enabled: process.env.MAILING_ENABLED ? process.env.MAILING_ENABLED === 'true' : true,
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    username: process.env.SMTP_USERNAME || '',
    password: process.env.SMTP_PASSWORD || '',
  },
};
