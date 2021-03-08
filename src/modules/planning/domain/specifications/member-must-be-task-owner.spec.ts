import { MemberEntityBuilder } from '../../../../../test/builder/member-entity.builder';
import { TaskEntityBuilder } from '../../../../../test/builder/task-entity.builder';
import { MemberMustBeTaskOwner } from './member-must-be-task-owner';

describe('MemberMustBeTaskOwner', () => {
  it('should be satisfied if the member is the task owner', () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(member.ownerId).build();
    const spec = new MemberMustBeTaskOwner(task);

    // When
    const result = spec.satisfiedBy(member.ownerId);

    // Then
    expect.assertions(1);
    expect(result).toBe(true);
  });

  it('should not be satisfied if the member is not the task owner', () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().build();
    const spec = new MemberMustBeTaskOwner(task);

    // When
    const result = spec.satisfiedBy(member.ownerId);

    // Then
    expect.assertions(1);
    expect(result).toBe(false);
  });
});
