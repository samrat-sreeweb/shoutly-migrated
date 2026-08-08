import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { OutstandExceptionFilter } from './common/filters/outstand-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const corsOriginRaw =
    config.get<string>('CORS_ORIGIN') || 'http://localhost:5173';
  const allowedOrigins = corsOriginRaw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  // Vercel production/preview aliases for this app change often — allow them by pattern.
  const vercelFrontend = /^https:\/\/shoutly-frontend[\w-]*\.vercel\.app$/i;

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.includes(origin) || vercelFrontend.test(origin)) {
        callback(null, true);
        return;
      }
      callback(null, false);
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new OutstandExceptionFilter());

  const port = config.get<number>('PORT') || 3000;
  // Bind all interfaces — required on Render (and most PaaS hosts).
  await app.listen(port, '0.0.0.0');
  console.log(`ShoutlyAI Nest backend listening on http://0.0.0.0:${port}`);
  console.log(
    `CORS allowlist: ${allowedOrigins.join(', ')} + shoutly-frontend*.vercel.app`,
  );
}

bootstrap();
