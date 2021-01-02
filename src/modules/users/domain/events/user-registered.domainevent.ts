import { DomainEvent } from '../../../../shared/domain';
import { UserSnapshot } from '../user-snapshot';
import { User } from '../user.entity';

export class UserRegistered implements DomainEvent {
  public readonly occurredOn: Date;
  public readonly user: UserSnapshot;

  constructor(user: User) {
    this.occurredOn = new Date();
    this.user = user.createSnapshot();
  }
}
