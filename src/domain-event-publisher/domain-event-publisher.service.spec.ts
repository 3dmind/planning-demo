import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { DomainEventPublisherService } from './domain-event-publisher.service';

describe('DomainEventPublisherService', () => {
  let service: DomainEventPublisherService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot({})],
      providers: [DomainEventPublisherService],
    }).compile();

    service = module.get<DomainEventPublisherService>(
      DomainEventPublisherService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
