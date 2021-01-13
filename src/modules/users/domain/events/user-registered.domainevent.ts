import { DomainEvent } from '../../../../shared/domain';
import { User } from '../user.entity';

export class UserRegistered implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly user: User;

  constructor(user: User) {
    this.occurredOn = new Date();
    this.user = user;
  }
}
