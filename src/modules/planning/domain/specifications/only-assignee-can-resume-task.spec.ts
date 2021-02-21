import { MemberEntityBuilder } from '../../../../../test/builder/member-entity.builder';
import { TaskEntityBuilder } from '../../../../../test/builder/task-entity.builder';
import { OnlyAssigneeCanResumeTask } from './only-assignee-can-resume-task';

describe('OnlyAssigneeCanResumeTask', () => {
  it('should be satisfied if the member is assigned to the task', () => {
    expect.assertions(1);
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder()
      .withAssigneeId(member.assigneeId)
      .makeTickedOff()
      .build();
    const spec = new OnlyAssigneeCanResumeTask(task);

    const result = spec.satisfiedBy(member.assigneeId);

    expect(result).toBe(true);
  });

  it('should not be satisfied if the member is not assigned to the task', () => {
    expect.assertions(1);
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().makeTickedOff().build();
    const spec = new OnlyAssigneeCanResumeTask(task);

    const result = spec.satisfiedBy(member.assigneeId);

    expect(result).toBe(false);
  });
});
