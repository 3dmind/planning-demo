import { DomainEvent } from './domain-event.interface';

export class DomainEventCollection {
  private domainEvents: DomainEvent[] = [];

  public add(domainEvent: DomainEvent): void {
    this.domainEvents.push(domainEvent);
  }

  public clear(): void {
    this.domainEvents.length = 0;
  }

  public toArray(): DomainEvent[] {
    return [...this.domainEvents];
  }
}
