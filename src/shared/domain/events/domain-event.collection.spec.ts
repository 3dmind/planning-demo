import { DomainEventCollection } from './domain-event.collection';
import { DomainEvent } from './domain-event.interface';

describe('DomainEventCollection', () => {
  it('should be defined', () => {
    expect.assertions(1);

    const domainEventCollection = new DomainEventCollection();

    expect(domainEventCollection).toBeDefined();
  });

  it('should add domain events', () => {
    expect.assertions(1);
    const event = {} as DomainEvent;
    const domainEventCollection = new DomainEventCollection();
    domainEventCollection.add(event);

    const domainEvents = domainEventCollection.toArray();

    expect(domainEvents).toContain(event);
  });

  it('should clear all domain events', () => {
    expect.assertions(1);
    const event = {} as DomainEvent;
    const domainEventCollection = new DomainEventCollection();
    domainEventCollection.add(event);

    domainEventCollection.clear();
    const domainEvents = domainEventCollection.toArray();

    expect(domainEvents.length).toBe(0);
  });
});
