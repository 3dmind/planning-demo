import * as faker from 'faker';
import * as uuid from 'uuid';
import { UniqueEntityID } from '../../../shared/domain';
import { Description } from './description';
import { Task } from './task';
import { TaskId } from './task-id';

jest.mock('uuid');

describe('Task', () => {
  beforeAll(() => {
    uuid.v4.mockReturnValue(faker.random.uuid());
  });

  afterAll(() => {
    uuid.mockRestore();
  });

  it(`should guard 'description' against 'null' or 'undefined'`, () => {
    const taskResultNull = Task.create({
      createdAt: null,
      description: null,
      tickedOff: null,
    });
    const taskResultUndefined = Task.create({
      createdAt: undefined,
      description: undefined,
      tickedOff: undefined,
    });

    expect(taskResultNull.isFailure).toBe(true);
    expect(taskResultUndefined.isFailure).toBe(true);
  });

  it('should create task', () => {
    const text = faker.lorem.words(5);
    const entityId = new UniqueEntityID();
    const description = Description.create(text).getValue();

    const taskResult = Task.create(
      {
        createdAt: new Date(),
        description,
        tickedOff: false,
      },
      entityId,
    );
    const task = taskResult.getValue();

    expect(taskResult.isSuccess).toBe(true);
    expect(task.taskId).toBeInstanceOf(TaskId);
    expect(task.taskId.id.equals(entityId)).toBe(true);
  });

  it('should note new task', () => {
    const text = faker.lorem.words(5);
    const description = Description.create(text).getValue();

    const taskResult = Task.note(description);
    const task = taskResult.getValue();

    expect(taskResult.isSuccess).toBe(true);
    expect(task.taskId.id.toValue()).toBeDefined();
  });

  it('should take a snapshot of its internal state', () => {
    const uuid = '8597ccd9-4237-44a6-b434-8836693c4b51';
    const text = 'Lorem ipsum';
    const entityId = new UniqueEntityID(uuid);
    const description = Description.create(text).getValue();
    const task = Task.create(
      {
        createdAt: new Date(Date.parse('1977-01-01')),
        description,
        tickedOff: false,
      },
      entityId,
    ).getValue();

    const taskSnapshot = task.createSnapshot();

    expect(taskSnapshot).toMatchSnapshot();
    expect(Object.isFrozen(taskSnapshot)).toBe(true);
  });
});
