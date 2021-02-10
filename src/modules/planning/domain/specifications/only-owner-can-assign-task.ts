import { Specification } from '../../../../shared/core';
import { OwnerId } from '../owner-id.entity';
import { Task } from '../task.entity';

export class OnlyOwnerCanAssignTask implements Specification<OwnerId> {
  private readonly task: Task;

  constructor(task: Task) {
    this.task = task;
  }

  public satisfiedBy(ownerId: OwnerId): boolean {
    return this.task.ownerId.equals(ownerId);
  }
}
