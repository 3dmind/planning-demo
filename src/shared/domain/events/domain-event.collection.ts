import { DomainEvent } from './domain-event.interface';

export class DomainEventCollection {
  private domainEvents: DomainEvent[] = [];

  public add(domainEvent: DomainEvent): void {
    this.domainEvents.push(domainEvent);
  }

  public clear(): void {
    this.domainEvents.length = 0;
  }

  // Refactor: Combine `toArray` and `clear` in one method
  // See https://github.com/3dmind/java-ddd-skeleton/blob/38383e48f8f893561f48c89f61639b3ed846d5b5/src/shared/main/tv/codely/shared/domain/AggregateRoot.java#L12
  public toArray(): DomainEvent[] {
    return [...this.domainEvents];
  }
}
