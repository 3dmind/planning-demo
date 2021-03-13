import { DomainEventCollection } from './domain-event.collection';
import { DomainEvent } from './domain-event.interface';

describe('DomainEventCollection', () => {
  it('should add domain events', () => {
    // Given
    const event = {} as DomainEvent;
    const domainEventCollection = new DomainEventCollection();
    domainEventCollection.add(event);

    // When
    const domainEvents = domainEventCollection.toArray();

    // Then
    expect.assertions(1);
    expect(domainEvents).toContain(event);
  });

  it('should clear all domain events', () => {
    // Given
    const event = {} as DomainEvent;
    const domainEventCollection = new DomainEventCollection();
    domainEventCollection.add(event);

    // When
    domainEventCollection.clear();
    const domainEvents = domainEventCollection.toArray();

    // Then
    expect.assertions(1);
    expect(domainEvents.length).toBe(0);
  });
});
