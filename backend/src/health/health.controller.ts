import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
  @Get()
  root() {
    return {
      success: true,
      name: 'shoutly-backend',
      message: 'ShoutlyAI NestJS API is running',
    };
  }

  @Get('api/health')
  health() {
    return { success: true, status: 'ok' };
  }
}
