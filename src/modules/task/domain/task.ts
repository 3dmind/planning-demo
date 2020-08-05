import { Guard, Result } from '../../../shared/core';
import { Entity, UniqueEntityID } from '../../../shared/domain';
import { Description } from './description';
import { TaskId } from './task-id';
import { TaskProps } from './task-props';
import { TaskSnapshot } from './task-snapshot';

export class Task extends Entity<TaskProps> {
  private constructor(props: TaskProps, id?: UniqueEntityID) {
    super(props, id);
  }

  get taskId(): TaskId {
    return TaskId.create(this._id).getValue();
  }

  public static create(props: TaskProps, id?: UniqueEntityID): Result<Task> {
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
    ]);

    if (!nullGuard.succeeded) {
      return Result.fail<Task>(nullGuard.message);
    }

    return Result.ok<Task>(new Task(props, id));
  }

  public static note(description: Description): Result<Task> {
    return Task.create({
      description,
      createdAt: new Date(),
      tickedOff: false,
    });
  }

  createSnapshot(): TaskSnapshot {
    return new TaskSnapshot(this.props, this.taskId);
  }
}
