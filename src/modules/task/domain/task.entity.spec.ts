import * as faker from 'faker';
import * as uuid from 'uuid';
import { TaskEntityBuilder } from '../../../../test/builder/task-entity.builder';
import { UniqueEntityId } from '../../../shared/domain';
import { DescriptionValueObject } from './description.value-object';
import { TaskIdEntity } from './task-id.entity';
import { TaskEntity } from './task.entity';

jest.mock('uuid');

describe('TaskEntity', () => {
  beforeAll(() => {
    uuid.v4.mockReturnValue(faker.random.uuid());
  });

  afterAll(() => {
    uuid.mockRestore();
  });

  it(`should guard 'description' against 'null' or 'undefined'`, () => {
    const taskResultNull = TaskEntity.create({
      archived: null,
      archivedAt: null,
      createdAt: null,
      description: null,
      editedAt: null,
      resumedAt: null,
      tickedOff: null,
      tickedOffAt: null,
    });
    const taskResultUndefined = TaskEntity.create({
      archived: undefined,
      archivedAt: undefined,
      createdAt: undefined,
      description: undefined,
      editedAt: undefined,
      resumedAt: undefined,
      tickedOff: undefined,
      tickedOffAt: undefined,
    });

    expect(taskResultNull.isFailure).toBe(true);
    expect(taskResultUndefined.isFailure).toBe(true);
  });

  it('should create task', () => {
    const text = faker.lorem.words(5);
    const entityId = new UniqueEntityId();
    const description = DescriptionValueObject.create(text).getValue();

    const taskResult = TaskEntity.create(
      {
        archived: false,
        archivedAt: null,
        createdAt: new Date(),
        description,
        editedAt: null,
        resumedAt: null,
        tickedOff: false,
        tickedOffAt: null,
      },
      entityId,
    );
    const task = taskResult.getValue();

    expect(taskResult.isSuccess).toBe(true);
    expect(task.taskId).toBeInstanceOf(TaskIdEntity);
    expect(task.taskId.id.equals(entityId)).toBe(true);
  });

  it('should note new task', () => {
    const text = faker.lorem.words(5);
    const description = DescriptionValueObject.create(text).getValue();

    const taskResult = TaskEntity.note(description);
    const task = taskResult.getValue();

    expect(taskResult.isSuccess).toBe(true);
    expect(task.taskId.id.toValue()).toBeDefined();
  });

  it('should tick off task', () => {
    const text = faker.lorem.words(5);
    const task = new TaskEntityBuilder(text).build();

    task.tickOff();

    expect(task.isTickedOff()).toBe(true);
  });

  it('should resume task', () => {
    expect.assertions(1);
    const text = faker.lorem.words(5);
    const task = new TaskEntityBuilder(text).makeTickedOff().build();

    task.resume();

    expect(task.isTickedOff()).toBe(false);
  });

  it('should archive task', () => {
    expect.assertions(1);
    const text = faker.lorem.words(5);
    const task = new TaskEntityBuilder(text).build();

    task.archive();

    expect(task.isArchived()).toBe(true);
  });

  it('should edit description', () => {
    expect.assertions(1);
    const text = faker.lorem.words(5);
    const task = new TaskEntityBuilder(text).build();
    const newText = faker.lorem.words(5);
    const newDescription = DescriptionValueObject.create(newText).getValue();

    task.edit(newDescription);

    expect(task.props.description.equals(newDescription)).toBe(true);
  });
});
