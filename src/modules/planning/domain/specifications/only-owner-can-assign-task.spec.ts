import { MemberEntityBuilder } from '../../../../../test/builder/member-entity.builder';
import { TaskEntityBuilder } from '../../../../../test/builder/task-entity.builder';
import { OnlyOwnerCanAssignTask } from './only-owner-can-assign-task';

describe('OnlyOwnerCanAssignTask', () => {
  it('should be satisfied if member is the task owner', () => {
    expect.assertions(1);
    const taskOwner = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(taskOwner.ownerId).build();
    const onlyOwnerCanAssignTask = new OnlyOwnerCanAssignTask(task);

    const result = onlyOwnerCanAssignTask.satisfiedBy(taskOwner.ownerId);

    expect(result).toBe(true);
  });

  it('should not be satisfied if member is not the task owner', () => {
    expect.assertions(1);
    const taskOwner = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(taskOwner.ownerId).build();
    const otherMember = new MemberEntityBuilder().build();
    const onlyOwnerCanAssignTask = new OnlyOwnerCanAssignTask(task);

    const result = onlyOwnerCanAssignTask.satisfiedBy(otherMember.ownerId);

    expect(result).toBe(false);
  });
});
