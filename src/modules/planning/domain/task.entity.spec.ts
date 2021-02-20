import * as faker from 'faker';
import { TaskEntityBuilder } from '../../../../test/builder/task-entity.builder';
import { UniqueEntityId } from '../../../shared/domain';
import { AssigneeId } from './assignee-id.entity';
import { Description } from './description.valueobject';
import { OwnerId } from './owner-id.entity';
import { TaskId } from './task-id.entity';
import { TaskProps } from './task-props.interface';
import { Task } from './task.entity';

describe('Task', () => {
  it('should guard "description" property', () => {
    expect.assertions(1);
    const props = { description: null } as TaskProps;

    const result = Task.create(props);

    expect(result.isFailure).toBe(true);
  });

  it('should guard "createdAt" property', () => {
    expect.assertions(1);
    const description = Description.create(faker.lorem.words(5)).getValue();
    const props = {
      description,
      createdAt: null,
    } as TaskProps;

    const result = Task.create(props);

    expect(result.isFailure).toBe(true);
  });

  it('should guard "tickedOff" property', () => {
    expect.assertions(1);
    const description = Description.create(faker.lorem.words(5)).getValue();
    const createdAt = new Date();
    const props = {
      description,
      createdAt,
      tickedOff: null,
    } as TaskProps;

    const result = Task.create(props);

    expect(result.isFailure).toBe(true);
  });

  it('should guard "archived" property', () => {
    expect.assertions(1);
    const description = Description.create(faker.lorem.words(5)).getValue();
    const createdAt = new Date();
    const tickedOff = false;
    const props = {
      description,
      createdAt,
      tickedOff,
      archived: null,
    } as TaskProps;

    const result = Task.create(props);

    expect(result.isFailure).toBe(true);
  });

  it('should guard "discarded" property', () => {
    expect.assertions(1);
    const description = Description.create(faker.lorem.words(5)).getValue();
    const createdAt = new Date();
    const tickedOff = false;
    const archived = false;
    const props = {
      description,
      createdAt,
      tickedOff,
      archived,
      discarded: null,
    } as TaskProps;

    const result = Task.create(props);

    expect(result.isFailure).toBe(true);
  });

  it('should guard "ownerId" property', () => {
    expect.assertions(1);
    const description = Description.create(faker.lorem.words(5)).getValue();
    const createdAt = new Date();
    const tickedOff = false;
    const archived = false;
    const discarded = false;
    const props = {
      description,
      createdAt,
      tickedOff,
      archived,
      discarded,
      ownerId: null,
    } as TaskProps;

    const result = Task.create(props);

    expect(result.isFailure).toBe(true);
  });

  it('should guard "assigneeId" property', () => {
    expect.assertions(1);
    const description = Description.create(faker.lorem.words(5)).getValue();
    const ownerId = OwnerId.create().getValue();
    const createdAt = new Date();
    const tickedOff = false;
    const archived = false;
    const discarded = false;
    const props = {
      description,
      createdAt,
      tickedOff,
      archived,
      discarded,
      ownerId,
      assigneeId: null,
    } as TaskProps;

    const result = Task.create(props);

    expect(result.isFailure).toBe(true);
  });

  it('should create task', () => {
    expect.assertions(5);
    const text = faker.lorem.words(5);
    const description = Description.create(text).getValue();
    const ownerId = OwnerId.create().getValue();
    const assigneeId = AssigneeId.create().getValue();
    const entityId = new UniqueEntityId();

    const taskResult = Task.create(
      {
        archived: false,
        archivedAt: null,
        assigneeId,
        createdAt: new Date(),
        description,
        discarded: false,
        discardedAt: null,
        editedAt: null,
        ownerId,
        resumedAt: null,
        tickedOff: false,
        tickedOffAt: null,
      },
      entityId,
    );
    const task = taskResult.getValue();

    expect(taskResult.isSuccess).toBe(true);
    expect(task.taskId).toBeInstanceOf(TaskId);
    expect(task.taskId.id.equals(entityId)).toBe(true);
    expect(task.ownerId.equals(ownerId)).toBe(true);
    expect(task.assigneeId.equals(assigneeId)).toBe(true);
  });

  it('should create snapshot', () => {
    expect.assertions(2);
    const task = new TaskEntityBuilder()
      .withDescription('Lorem ipsum')
      .withId(new UniqueEntityId('8bb2a83e-cf7e-46d7-a7b0-49f49d94c460'))
      .withOwnerId(
        OwnerId.create(
          new UniqueEntityId('74d21847-3298-4775-aaf8-942fed0f53e7'),
        ).getValue(),
      )
      .withAssigneeId(
        AssigneeId.create(
          new UniqueEntityId('27f0ca32-e888-4fcc-9908-b24bf152573d'),
        ).getValue(),
      )
      .withCreationDate(new Date(Date.parse('1977-01-01')))
      .build();

    const taskSnapshot = task.createSnapshot();

    expect(taskSnapshot).toMatchSnapshot();
    expect(Object.isFrozen(taskSnapshot)).toBe(true);
  });

  it('should note new task', () => {
    expect.assertions(1);
    const text = faker.lorem.words(5);
    const description = Description.create(text).getValue();
    const ownerId = OwnerId.create().getValue();
    const assigneeId = AssigneeId.create().getValue();

    const taskResult = Task.note(description, ownerId, assigneeId);

    expect(taskResult.isSuccess).toBe(true);
  });

  describe('tick-off task', () => {
    it('should be able to be ticked-off by the assigned member', () => {
      expect.assertions(2);
      const assigneeId = AssigneeId.create(new UniqueEntityId()).getValue();
      const task = new TaskEntityBuilder().withAssigneeId(assigneeId).build();

      const result = task.tickOff(assigneeId);

      expect(result.isSuccess).toBe(true);
      expect(task.isTickedOff()).toBe(true);
    });

    it('should not be able to be ticked-off by a not assigned member', () => {
      expect.assertions(2);
      const assigneeId = AssigneeId.create(new UniqueEntityId()).getValue();
      const task = new TaskEntityBuilder().build();

      const result = task.tickOff(assigneeId);

      expect(result.isFailure).toBe(true);
      expect(task.isTickedOff()).toBe(false);
    });
  });

  it('should resume task', () => {
    expect.assertions(1);
    const task = new TaskEntityBuilder().makeTickedOff().build();

    task.resume();

    expect(task.isTickedOff()).toBe(false);
  });

  it('should archive task', () => {
    expect.assertions(1);
    const task = new TaskEntityBuilder().build();

    task.archive();

    expect(task.isArchived()).toBe(true);
  });

  it('should edit description', () => {
    expect.assertions(1);
    const text = faker.lorem.words(5);
    const task = new TaskEntityBuilder().withDescription(text).build();
    const newText = faker.lorem.words(5);
    const newDescription = Description.create(newText).getValue();

    task.edit(newDescription);

    expect(task.props.description.equals(newDescription)).toBe(true);
  });

  it('should discard task', () => {
    expect.assertions(1);
    const task = new TaskEntityBuilder().build();

    task.discard();

    expect(task.isDiscarded()).toBe(true);
  });

  describe('assign task', () => {
    it('should only be assignable by task owner', () => {
      expect.assertions(2);
      const taskOwnerId = OwnerId.create().getValue();
      const assigneeId = AssigneeId.create().getValue();
      const otherOwnerId = OwnerId.create().getValue();
      const taskOne = new TaskEntityBuilder().withOwnerId(taskOwnerId).build();
      const taskTwo = new TaskEntityBuilder().withOwnerId(taskOwnerId).build();

      const resultOne = taskOne.assign(taskOwnerId, assigneeId);
      const resultTwo = taskTwo.assign(otherOwnerId, assigneeId);

      expect(resultOne.isSuccess).toBe(true);
      expect(resultTwo.isFailure).toBe(true);
    });

    it('should not be assignable if the member is assigned already', () => {
      expect.assertions(1);
      const taskOwnerId = OwnerId.create().getValue();
      const assigneeId = AssigneeId.create().getValue();
      const task = new TaskEntityBuilder()
        .withOwnerId(taskOwnerId)
        .withAssigneeId(assigneeId)
        .build();

      const result = task.assign(taskOwnerId, assigneeId);

      expect(result.isFailure).toBe(true);
    });
  });
});
