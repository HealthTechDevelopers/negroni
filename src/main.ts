require('dotenv').config()

process.env.TZ = 'UTC'

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

(async () => {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'debug', 'log', 'verbose']
  });

  await app.listen(process.env.PORT || 3000);
})()
