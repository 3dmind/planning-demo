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

    cache = module.get(CACHE_MANAGER);
    service = module.get<RedisCacheService>(RedisCacheService);
  });

  afterAll(async () => {
    await cache.reset();
  });

  it('should store value', () => {
    // Given
    const keyFixture = faker.lorem.word(6);
    const valueFixture = faker.lorem.word(12);
    const ttlFixture = 5;

    // When
    const result = service.set(keyFixture, valueFixture, {
      ttl: ttlFixture,
    });

    // Then
    expect.assertions(1);
    expect(result).resolves.toBe(valueFixture);
  });

  it('should read value', async () => {
    // Given
    const keyFixture = faker.lorem.word(6);
    const valueFixture = faker.lorem.word(12);
    const ttlFixture = 5;
    await service.set(keyFixture, valueFixture, {
      ttl: ttlFixture,
    });

    // When
    const result = await service.get(keyFixture);

    // Then
    expect.assertions(1);
    expect(result).toEqual(valueFixture);
  });

  it('should delete value', () => {
    // Given
    const keyFixture = faker.lorem.word(6);
    const valueFixture = faker.lorem.word(12);
    const ttlFixture = 10;
    service.set(keyFixture, valueFixture, {
      ttl: ttlFixture,
    });

    // When
    const delResult = service.del(keyFixture);
    const getResult = service.get(keyFixture);

    // Then
    expect.assertions(2);
    expect(delResult).resolves.toBeUndefined();
    expect(getResult).resolves.toBeUndefined();
  });
});
