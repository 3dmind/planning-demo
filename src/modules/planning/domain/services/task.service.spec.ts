import * as faker from 'faker';
import { MemberEntityBuilder } from '../../../../../test/builder/member-entity.builder';
import { Description } from '../description.valueobject';
import { TaskService } from './task.service';

describe('TaskService', () => {
  it('should note task and assign to member', () => {
    expect.assertions(3);
    const text = faker.lorem.words(5);
    const description = Description.create(text).getValue();
    const member = new MemberEntityBuilder().build();
    const taskService = new TaskService();

    const result = taskService.noteTaskAndAssignToMember(description, member);
    const task = result.getValue();

    expect(result.isSuccess).toBe(true);
    expect(task.ownerId.equals(member.ownerId)).toBe(true);
    expect(task.assigneeId.equals(member.assigneeId)).toBe(true);
  });
});
