import { MemberEntityBuilder } from '../../../../../test/builder/member-entity.builder';
import { TaskEntityBuilder } from '../../../../../test/builder/task-entity.builder';
import { MemberMustBeTaskAssignee } from './member-must-be-task-assignee';

describe('MemberMustBeTaskAssignee', () => {
  it('should be satisfied if the member is assigned to the task', () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withAssigneeId(member.assigneeId).build();
    const spec = new MemberMustBeTaskAssignee(task);

    // When
    const result = spec.satisfiedBy(member.assigneeId);

    // Then
    expect.assertions(1);
    expect(result).toBe(true);
  });

  it('should not be satisfied if the member is not assigned to the task', () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().build();
    const spec = new MemberMustBeTaskAssignee(task);

    // When
    const result = spec.satisfiedBy(member.assigneeId);

    // Then
    expect.assertions(1);
    expect(result).toBe(false);
  });
});
