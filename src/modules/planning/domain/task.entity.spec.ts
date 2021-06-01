import * as faker from 'faker';
import { TaskEntityBuilder } from '../../../../test/builder/task-entity.builder';
import { UniqueEntityId } from '../../../shared/domain';
import { AssigneeId } from './assignee-id.entity';
import { Description } from './description.valueobject';
import { MemberId } from './member-id.entity';
import { OwnerId } from './owner-id.entity';
import { TaskId } from './task-id.entity';
import { TaskProps } from './task-props.interface';
import { Task } from './task.entity';

describe('Task', () => {
  it('should guard "description" property', () => {
    // Given
    const props = { description: null } as TaskProps;

    // When
    const result = Task.create(props);

    // Then
    expect.assertions(1);
    expect(result.isFailure).toBe(true);
  });

  it('should guard "createdAt" property', () => {
    // Given
    const description = Description.create(faker.lorem.words(5)).getValue();
    const props = {
      description,
      createdAt: null,
    } as TaskProps;

    // When
    const result = Task.create(props);

    // Then
    expect.assertions(1);
    expect(result.isFailure).toBe(true);
  });

  it('should guard "tickedOff" property', () => {
    // Given
    const description = Description.create(faker.lorem.words(5)).getValue();
    const createdAt = new Date();
    const props = {
      description,
      createdAt,
      tickedOff: null,
    } as TaskProps;

    // When
    const result = Task.create(props);

    // Then
    expect.assertions(1);
    expect(result.isFailure).toBe(true);
  });

  it('should guard "archived" property', () => {
    // Given
    const description = Description.create(faker.lorem.words(5)).getValue();
    const createdAt = new Date();
    const tickedOff = false;
    const props = {
      description,
      createdAt,
      tickedOff,
      archived: null,
    } as TaskProps;

    // When
    const result = Task.create(props);

    // Then
    expect.assertions(1);
    expect(result.isFailure).toBe(true);
  });

  it('should guard "discarded" property', () => {
    // Given
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

    // When
    const result = Task.create(props);

    // Then
    expect.assertions(1);
    expect(result.isFailure).toBe(true);
  });

  it('should guard "ownerId" property', () => {
    // Given
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

    // When
    const result = Task.create(props);

    // Then
    expect.assertions(1);
    expect(result.isFailure).toBe(true);
  });

  it('should guard "assigneeId" property', () => {
    // Given
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

    // When
    const result = Task.create(props);

    // Then
    expect.assertions(1);
    expect(result.isFailure).toBe(true);
  });

  it('should create task', () => {
    // Given
    const text = faker.lorem.words(5);
    const description = Description.create(text).getValue();
    const ownerId = OwnerId.create().getValue();
    const assigneeId = AssigneeId.create().getValue();
    const entityId = new UniqueEntityId();

    // When
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

    // Then
    expect.assertions(6);
    expect(taskResult.isSuccess).toBe(true);
    expect(task.taskId).toBeInstanceOf(TaskId);
    expect(task.taskId.id.equals(entityId)).toBe(true);
    expect(task.ownerId.equals(ownerId)).toBe(true);
    expect(task.assigneeId.equals(assigneeId)).toBe(true);
    expect(task.description.equals(description)).toBe(true);
  });

  it('should create snapshot', () => {
    // Given
    const task = new TaskEntityBuilder()
      .withDescription('Lorem ipsum')
      .withId(new UniqueEntityId('8bb2a83e-cf7e-46d7-a7b0-49f49d94c460'))
      .withOwnerId(OwnerId.create(new UniqueEntityId('74d21847-3298-4775-aaf8-942fed0f53e7')).getValue())
      .withAssigneeId(AssigneeId.create(new UniqueEntityId('27f0ca32-e888-4fcc-9908-b24bf152573d')).getValue())
      .withCreationDate(new Date(Date.parse('1977-01-01')))
      .build();

    // When
    const taskSnapshot = task.createSnapshot();

    // Then
    expect.assertions(2);
    expect(taskSnapshot).toMatchSnapshot();
    expect(Object.isFrozen(taskSnapshot)).toBe(true);
  });

  it('should note new task', () => {
    // Given
    const text = faker.lorem.words(5);
    const description = Description.create(text).getValue();
    const ownerId = OwnerId.create().getValue();
    const assigneeId = AssigneeId.create().getValue();

    // When
    const taskResult = Task.note(description, ownerId, assigneeId);

    // Then
    expect.assertions(1);
    expect(taskResult.isSuccess).toBe(true);
  });

  describe('tick-off task', () => {
    it('should be able to be ticked-off by the assigned member', () => {
      // Given
      const assigneeId = AssigneeId.create(new UniqueEntityId()).getValue();
      const task = new TaskEntityBuilder().withAssigneeId(assigneeId).build();

      // When
      const result = task.tickOff(assigneeId);

      // Then
      expect.assertions(2);
      expect(result.isSuccess).toBe(true);
      expect(task.isTickedOff()).toBe(true);
    });

    it('should not be able to be ticked-off by a not assigned member', () => {
      // Given
      const assigneeId = AssigneeId.create(new UniqueEntityId()).getValue();
      const task = new TaskEntityBuilder().build();

      // When
      const result = task.tickOff(assigneeId);

      // Then
      expect.assertions(2);
      expect(result.isFailure).toBe(true);
      expect(task.isTickedOff()).toBe(false);
    });
  });

  describe('resume task', () => {
    it('should be able to be resumed by the assigned member', () => {
      // Given
      const assigneeId = AssigneeId.create(new UniqueEntityId()).getValue();
      const task = new TaskEntityBuilder().withAssigneeId(assigneeId).makeTickedOff().build();

      // When
      const result = task.resume(assigneeId);

      // Then
      expect.assertions(2);
      expect(result.isSuccess).toBe(true);
      expect(task.isTickedOff()).toBe(false);
    });

    it('should not be able to be resumed by a not assigned member', () => {
      // Given
      const assigneeId = AssigneeId.create(new UniqueEntityId()).getValue();
      const task = new TaskEntityBuilder().makeTickedOff().build();

      // When
      const result = task.resume(assigneeId);

      // Then
      expect.assertions(2);
      expect(result.isFailure).toBe(true);
      expect(task.isTickedOff()).toBe(true);
    });
  });

  describe('edit task description', () => {
    it('should be able to be edited by the task owner', () => {
      // Given
      const text = faker.lorem.words(5);
      const ownerId = OwnerId.create(new UniqueEntityId()).getValue();
      const task = new TaskEntityBuilder().withDescription(text).withOwnerId(ownerId).build();
      const newText = faker.lorem.words(5);
      const newDescription = Description.create(newText).getValue();

      // When
      const result = task.edit(newDescription, ownerId);

      // Then
      expect.assertions(2);
      expect(result.isSuccess).toBe(true);
      expect(task.props.description.equals(newDescription)).toBe(true);
    });

    it('should not be able to be edited by another member', () => {
      // Given
      const text = faker.lorem.words(5);
      const memberId = MemberId.create(new UniqueEntityId()).getValue();
      const task = new TaskEntityBuilder().withDescription(text).build();
      const newText = faker.lorem.words(5);
      const newDescription = Description.create(newText).getValue();

      // When
      const result = task.edit(newDescription, memberId);

      // Then
      expect.assertions(2);
      expect(result.isFailure).toBe(true);
      expect(task.props.description.equals(newDescription)).toBe(false);
    });
  });

  describe('assign task', () => {
    it('should only be assignable by task owner', () => {
      // Given
      const taskOwnerId = OwnerId.create().getValue();
      const assigneeId = AssigneeId.create().getValue();
      const otherOwnerId = OwnerId.create().getValue();
      const taskOne = new TaskEntityBuilder().withOwnerId(taskOwnerId).build();
      const taskTwo = new TaskEntityBuilder().withOwnerId(taskOwnerId).build();

      // When
      const resultOne = taskOne.assign(taskOwnerId, assigneeId);
      const resultTwo = taskTwo.assign(otherOwnerId, assigneeId);

      // Then
      expect.assertions(2);
      expect(resultOne.isSuccess).toBe(true);
      expect(resultTwo.isFailure).toBe(true);
    });

    it('should not be assignable if the member is assigned already', () => {
      // Given
      const taskOwnerId = OwnerId.create().getValue();
      const assigneeId = AssigneeId.create().getValue();
      const task = new TaskEntityBuilder().withOwnerId(taskOwnerId).withAssigneeId(assigneeId).build();

      // When
      const result = task.assign(taskOwnerId, assigneeId);

      // Then
      expect.assertions(1);
      expect(result.isFailure).toBe(true);
    });
  });

  describe('archive task', () => {
    it('should be able to be archived by the task owner', () => {
      // Given
      const ownerId = OwnerId.create(new UniqueEntityId()).getValue();
      const task = new TaskEntityBuilder().withOwnerId(ownerId).build();

      // When
      const result = task.archive(ownerId);

      // Then
      expect.assertions(2);
      expect(result.isSuccess).toBe(true);
      expect(task.isArchived()).toBe(true);
    });

    it('should not be able to be archived by another member', () => {
      // Given
      const memberId = MemberId.create(new UniqueEntityId()).getValue();
      const task = new TaskEntityBuilder().build();

      // When
      const result = task.archive(memberId);

      // Then
      expect.assertions(2);
      expect(result.isFailure).toBe(true);
      expect(task.isArchived()).toBe(false);
    });
  });

  describe('discard task', () => {
    it('should be able to be discarded by the task owner', () => {
      // Given
      const ownerId = OwnerId.create(new UniqueEntityId()).getValue();
      const task = new TaskEntityBuilder().withOwnerId(ownerId).build();

      // When
      const result = task.discard(ownerId);

      // Then
      expect.assertions(2);
      expect(result.isSuccess).toBe(true);
      expect(task.isDiscarded()).toBe(true);
    });

    it('should not be able to be discarded by another member', () => {
      // Given
      const memberId = MemberId.create(new UniqueEntityId()).getValue();
      const task = new TaskEntityBuilder().build();

      // When
      const result = task.discard(memberId);

      // Then
      expect.assertions(2);
      expect(result.isFailure).toBe(true);
      expect(task.isDiscarded()).toBe(false);
    });
  });
});
