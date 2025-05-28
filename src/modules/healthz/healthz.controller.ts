import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  // @ApiBearerAuth('BearerAuth')
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),
    ]);
  }
}
