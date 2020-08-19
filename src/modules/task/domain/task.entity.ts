import { Guard, Result } from '../../../shared/core';
import { Entity, UniqueEntityId } from '../../../shared/domain';
import { DescriptionValueObject } from './description.value-object';
import { TaskIdEntity } from './task-id.entity';
import { TaskPropsInterface } from './task-props.interface';
import { TaskSnapshot } from './task-snapshot';

export class TaskEntity extends Entity<TaskPropsInterface> {
  private constructor(props: TaskPropsInterface, id?: UniqueEntityId) {
    super(props, id);
  }

  get taskId(): TaskIdEntity {
    return TaskIdEntity.create(this._id).getValue();
  }

  public static create(
    props: TaskPropsInterface,
    id?: UniqueEntityId,
  ): Result<TaskEntity> {
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
      return Result.fail<TaskEntity>(nullGuard.message);
    }

    return Result.ok<TaskEntity>(new TaskEntity(props, id));
  }

  public static note(description: DescriptionValueObject): Result<TaskEntity> {
    return TaskEntity.create({
      createdAt: new Date(),
      description,
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
}
