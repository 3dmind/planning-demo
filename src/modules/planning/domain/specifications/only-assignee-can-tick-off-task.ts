import { Specification } from '../../../../shared/core';
import { AssigneeId } from '../assignee-id.entity';
import { Task } from '../task.entity';

export class OnlyAssigneeCanTickOffTask implements Specification<AssigneeId> {
  private readonly task: Task;

  constructor(task: Task) {
    this.task = task;
  }

  satisfiedBy(assigneeId: AssigneeId): boolean {
    return this.task.assigneeId.equals(assigneeId);
  }
}
