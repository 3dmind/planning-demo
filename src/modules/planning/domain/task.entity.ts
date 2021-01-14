import { Guard, Result } from '../../../shared/core';
import { Entity, UniqueEntityId } from '../../../shared/domain';
import { Description } from './description.valueobject';
import { OwnerId } from './owner-id.entity';
import { TaskId } from './task-id.entity';
import { TaskProps } from './task-props.interface';
import { TaskSnapshot } from './task-snapshot';

export class Task extends Entity<TaskProps> {
  private constructor(props: TaskProps, id?: UniqueEntityId) {
    super(props, id);
  }

  get taskId(): TaskId {
    return TaskId.create(this._id).getValue();
  }

  get ownerId(): OwnerId {
    return this.props.ownerId;
  }

  public static create(props: TaskProps, id?: UniqueEntityId): Result<Task> {
    const nullGuard = Guard.againstNullOrUndefinedBulk([
      {
        argument: props.description,
        argumentName: 'description',
      },
      {
        argument: props.createdAt,
        argumentName: 'createdAt',
      },
      {
        argument: props.tickedOff,
        argumentName: 'tickedOff',
      },
      {
        argument: props.archived,
        argumentName: 'archived',
      },
      {
        argument: props.discarded,
        argumentName: 'discarded',
      },
      {
        argument: props.ownerId,
        argumentName: 'ownerId',
      },
    ]);

    if (!nullGuard.succeeded) {
      return Result.fail<Task>(nullGuard.message);
    }

    return Result.ok<Task>(new Task(props, id));
  }

  public static note(description: Description, ownerId: OwnerId): Result<Task> {
    return Task.create({
      archived: false,
      archivedAt: null,
      createdAt: new Date(),
      description,
      discarded: false,
      discardedAt: null,
      editedAt: null,
      ownerId: ownerId,
      resumedAt: null,
      tickedOff: false,
      tickedOffAt: null,
    });
  }

  createSnapshot(): TaskSnapshot {
    return new TaskSnapshot(this.props, this.taskId);
  }

  tickOff(): void {
    this.props.tickedOff = true;
    this.props.tickedOffAt = new Date();
  }

  isTickedOff(): boolean {
    return this.props.tickedOff;
  }

  resume(): void {
    this.props.tickedOff = false;
    this.props.resumedAt = new Date();
  }

  archive(): void {
    this.props.archived = true;
    this.props.archivedAt = new Date();
  }

  isArchived(): boolean {
    return this.props.archived;
  }

  edit(newDescription: Description): void {
    this.props.description = newDescription;
    this.props.editedAt = new Date();
  }

  discard(): void {
    this.props.discarded = true;
    this.props.discardedAt = new Date();
  }

  isDiscarded(): boolean {
    return this.props.discarded;
  }
}
