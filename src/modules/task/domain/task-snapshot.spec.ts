import { UniqueEntityId } from '../../../shared/domain';
import { DescriptionValueObject } from './description.value-object';
import { TaskSnapshot } from './task-snapshot';
import { TaskEntity } from './task.entity';

describe('TaskSnapshot', () => {
  it("should take a snapshot of a task's internal state", () => {
    expect.assertions(2);
    const id = '8597ccd9-4237-44a6-b434-8836693c4b51';
    const entityId = new UniqueEntityId(id);
    const text = 'Lorem ipsum';
    const description = DescriptionValueObject.create(text).getValue();
    const task = TaskEntity.create(
      {
        createdAt: new Date(Date.parse('1977-01-01')),
        description,
        resumedAt: null,
        tickedOff: false,
        tickedOffAt: null,
      },
      entityId,
    ).getValue();

    const taskSnapshot = new TaskSnapshot(task.props, task.taskId);

    expect(taskSnapshot).toMatchSnapshot();
    expect(Object.isFrozen(taskSnapshot)).toBe(true);
  });
});
