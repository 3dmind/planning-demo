import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AggregateRoot } from '../shared/domain';

@Injectable()
export class DomainEventPublisherService {
  private readonly logger = new Logger(DomainEventPublisherService.name);

  constructor(private readonly eventEmitter: EventEmitter2) {}

  public publish(entity: AggregateRoot<unknown>): void {
    const domainEvents = entity.pullDomainEvents();
    try {
      for (const domainEvent of domainEvents) {
        const domainEventClass = Reflect.getPrototypeOf(domainEvent);
        const eventName = domainEventClass.constructor.name;
        this.logger.debug(`Publishing ${eventName}`);
        this.eventEmitter.emit(eventName, domainEvent);
      }
    } catch (error) {
      this.logger.error(error.message, error);
    }
  }
}
