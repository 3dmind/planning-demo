import { TaskEntityBuilder } from '../../../../test/builder/task-entity.builder';
import { TaskSnapshot } from './task-snapshot';

describe('TaskSnapshot', () => {
  it("should take a snapshot of a task's internal state", () => {
    expect.assertions(2);
    const id = '8597ccd9-4237-44a6-b434-8836693c4b51';
    const text = 'Lorem ipsum';
    const createdAt = new Date(Date.parse('1977-01-01'));
    const taskEntity = new TaskEntityBuilder(text, id, createdAt).build();

    const taskSnapshot = new TaskSnapshot(taskEntity.props, taskEntity.taskId);

    expect(taskSnapshot).toMatchSnapshot();
    expect(Object.isFrozen(taskSnapshot)).toBe(true);
  });
});
