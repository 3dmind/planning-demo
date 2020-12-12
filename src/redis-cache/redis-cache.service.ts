import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache, CachingConfig } from 'cache-manager';

@Injectable()
export class RedisCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  public async set<T>(
    key: string,
    value: T,
    config: CachingConfig,
  ): Promise<any> {
    return this.cache.set<T>(key, value, config);
  }

  public async get<T>(key: string): Promise<any> {
    return this.cache.get<T>(key);
  }

  public async del(key: string): Promise<any> {
    return this.cache.del(key);
  }
}
