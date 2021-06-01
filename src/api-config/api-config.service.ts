import { Injectable, LogLevel } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiConfig } from './api-config.interface';

@Injectable()
export class ApiConfigService {
  constructor(private readonly configService: ConfigService<ApiConfig>) {}

  isDevelopment(): boolean {
    return true;
  }

  getLogLevel(): LogLevel[] {
    if (this.isDevelopment()) {
      return ['debug', 'error', 'log', 'verbose', 'warn'];
    }
  }

  getRedisHost(): string {
    return this.configService.get('REDIS_HOST');
  }

  getRedisPort(): number {
    const DEFAULT_PORT = 6379;
    const parsedPort = Number.parseInt(this.configService.get('REDIS_PORT'), 10);

    if (Number.isNaN(parsedPort)) {
      return DEFAULT_PORT;
    } else {
      return parsedPort;
    }
  }

  getAccessTokenSecret(): string {
    return this.configService.get('JWT_ACCESS_TOKEN_SECRET');
  }

  getAccessTokenTtl(): number {
    const DEFAULT_TTL_IN_SECONDS = 300; // seconds => 5 minutes
    const parsedTtl = Number.parseInt(this.configService.get('JWT_ACCESS_TOKEN_TTL'), 10);

    if (Number.isNaN(parsedTtl)) {
      return DEFAULT_TTL_IN_SECONDS;
    } else {
      return parsedTtl;
    }
  }

  getRefreshTokenSecret(): string {
    return this.configService.get('JWT_REFRESH_TOKEN_SECRET');
  }

  getRefreshTokenTtl(): number {
    const DEFAULT_TTL_IN_SECONDS = 604800; // seconds => 7 days
    const parsedTtl = Number.parseInt(this.configService.get('JWT_REFRESH_TOKEN_TTL'), 10);

    if (Number.isNaN(parsedTtl)) {
      return DEFAULT_TTL_IN_SECONDS;
    } else {
      return parsedTtl;
    }
  }
}
