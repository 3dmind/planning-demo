import { Logger } from '@nestjs/common';
import { Entity } from './entity';
import { DomainEventCollection } from './events/domain-event.collection';
import { DomainEvent } from './events/domain-event.interface';
import { UniqueEntityId } from './unique-entity-id';

export abstract class AggregateRoot<T> extends Entity<T> {
  private readonly logger = new Logger();
  private readonly domainEventCollection = new DomainEventCollection();

  get id(): UniqueEntityId {
    return this._id;
  }

  public pullDomainEvents(): DomainEvent[] {
    const domainEvents = this.domainEventCollection.toArray();
    this.domainEventCollection.clear();
    return domainEvents;
  }

  protected addDomainEvent(domainEvent: DomainEvent): void {
    this.domainEventCollection.add(domainEvent);
    const thisClass = Reflect.getPrototypeOf(this);
    const eventClass = Reflect.getPrototypeOf(domainEvent);
    this.logger.debug(`Domain event created ${eventClass.constructor.name}`, thisClass.constructor.name);
  }
}
