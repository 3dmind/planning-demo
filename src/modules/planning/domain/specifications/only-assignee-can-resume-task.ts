import { Specification } from '../../../../shared/core';
import { AssigneeId } from '../assignee-id.entity';
import { Task } from '../task.entity';

export class OnlyAssigneeCanResumeTask implements Specification<AssigneeId> {
  private readonly task: Task;

  constructor(task: Task) {
    this.task = task;
  }

  satisfiedBy(id: AssigneeId): boolean {
    return this.task.assigneeId.equals(id);
  }
}
