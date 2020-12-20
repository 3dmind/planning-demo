import { CacheModule, Module } from '@nestjs/common';
import * as store from 'cache-manager-redis-store';
import { ApiConfigModule } from '../api-config/api-config.module';
import { ApiConfigService } from '../api-config/api-config.service';
import { RedisCacheService } from './redis-cache.service';

@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ApiConfigModule],
      inject: [ApiConfigService],
      useFactory: async (apiConfigService: ApiConfigService) => ({
        store,
        host: apiConfigService.getRedisHost(),
        port: apiConfigService.getRedisPort(),
      }),
    }),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
