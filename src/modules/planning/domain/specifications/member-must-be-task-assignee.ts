import { Specification } from '../../../../shared/core';
import { AssigneeId } from '../assignee-id.entity';
import { Task } from '../task.entity';

export class MemberMustBeTaskAssignee implements Specification<AssigneeId> {
  constructor(private readonly task: Task) {}

  public satisfiedBy(assigneeId: AssigneeId): boolean {
    return this.task.assigneeId.equals(assigneeId);
  }
}
