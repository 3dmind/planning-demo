import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { AggregateRoot, DomainEvent, UniqueEntityId } from '../shared/domain';
import { DomainEventPublisherService } from './domain-event-publisher.service';

describe('DomainEventPublisherService', () => {
  class DomainEventMock implements DomainEvent {
    readonly occurredOn: Date;
    readonly entity: EntityMock;

    constructor(entity: EntityMock) {
      this.occurredOn = new Date();
      this.entity = entity;
    }
  }

  class EntityMock extends AggregateRoot<null> {
    constructor(props: null, id: UniqueEntityId) {
      super(props, id);
      this.addDomainEvent(new DomainEventMock(this));
    }
  }

  let eventEmitter: EventEmitter2;
  let service: DomainEventPublisherService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [EventEmitterModule.forRoot({})],
      providers: [DomainEventPublisherService],
    }).compile();
    module.useLogger(false);

    eventEmitter = module.get<EventEmitter2>(EventEmitter2);
    service = module.get<DomainEventPublisherService>(
      DomainEventPublisherService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should publish domain events', () => {
    expect.assertions(1);
    const entityId = new UniqueEntityId();
    const entityMock = new EntityMock(null, entityId);
    const listenerSpy = jest.fn();
    eventEmitter.on(DomainEventMock.name, listenerSpy);

    service.publish(entityMock);

    expect(listenerSpy).toHaveBeenCalledTimes(1);
  });
});
