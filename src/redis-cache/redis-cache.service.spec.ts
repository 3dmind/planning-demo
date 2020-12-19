import { CACHE_MANAGER, CacheModule } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Cache } from 'cache-manager';
import * as faker from 'faker';
import { RedisCacheService } from './redis-cache.service';

describe('RedisCacheService', () => {
  let cache: Cache;
  let service: RedisCacheService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({ store: 'memory' })],
      providers: [RedisCacheService],
    }).compile();

    cache = await module.resolve(CACHE_MANAGER);
    service = module.get<RedisCacheService>(RedisCacheService);
  });

  afterAll(async () => {
    await cache.reset();
  });

  it('should store value', () => {
    expect.assertions(1);
    const keyFixture = faker.lorem.word(6);
    const valueFixture = faker.lorem.word(12);
    const ttlFixture = 5;

    const result = service.set(keyFixture, valueFixture, {
      ttl: ttlFixture,
    });

    expect(result).resolves.toBe(valueFixture);
  });

  it('should read value', async () => {
    expect.assertions(1);
    const keyFixture = faker.lorem.word(6);
    const valueFixture = faker.lorem.word(12);
    const ttlFixture = 5;
    await service.set(keyFixture, valueFixture, {
      ttl: ttlFixture,
    });

    const result = await service.get(keyFixture);

    expect(result).toEqual(valueFixture);
  });

  it('should delete value', () => {
    expect.assertions(2);
    const keyFixture = faker.lorem.word(6);
    const valueFixture = faker.lorem.word(12);
    const ttlFixture = 10;
    service.set(keyFixture, valueFixture, {
      ttl: ttlFixture,
    });

    const delResult = service.del(keyFixture);

    expect(delResult).resolves.toBeUndefined();

    const getResult = service.get(keyFixture);

    expect(getResult).resolves.toBeUndefined();
  });
});
