import { Specification } from '../../../../shared/core';
import { OwnerId } from '../owner-id.entity';
import { Task } from '../task.entity';

export class MemberMustBeTaskOwner implements Specification<OwnerId> {
  constructor(private readonly task: Task) {}

  satisfiedBy(ownerId: OwnerId): boolean {
    return this.task.ownerId.equals(ownerId);
  }
}
