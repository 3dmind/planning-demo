import { Guard, OrSpecification, Result } from '../../../shared/core';
import { Entity, UniqueEntityId } from '../../../shared/domain';
import { AssigneeId } from './assignee-id.entity';
import { Description } from './description.valueobject';
import { MemberId } from './member-id.entity';
import { OwnerId } from './owner-id.entity';
import { MemberHasNotYetBeenAssigned } from './specifications/member-has-not-yet-been-assigned';
import { MemberMustBeTaskAssignee } from './specifications/member-must-be-task-assignee';
import { MemberMustBeTaskOwner } from './specifications/member-must-be-task-owner';
import { TaskId } from './task-id.entity';
import { TaskProps } from './task-props.interface';
import { TaskSnapshot } from './task-snapshot';

export class Task extends Entity<TaskProps> {
  private readonly memberMustBeTaskOwner = new MemberMustBeTaskOwner(this);
  private readonly memberMustBeTaskAssignee = new MemberMustBeTaskAssignee(this);
  private readonly memberHasNotYetBeenAssigned = new MemberHasNotYetBeenAssigned(this);
  public readonly memberMustBeOwnerOrAssignee = new OrSpecification<MemberId>(
    this.memberMustBeTaskOwner,
    this.memberMustBeTaskAssignee,
  );

  private constructor(props: TaskProps, id?: UniqueEntityId) {
    super(props, id);
  }

  get taskId(): TaskId {
    return TaskId.create(this._id).getValue();
  }

  get ownerId(): OwnerId {
    return this.props.ownerId;
  }

  get assigneeId(): AssigneeId {
    return this.props.assigneeId;
  }

  get description(): Description {
    return this.props.description;
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
      {
        argument: props.assigneeId,
        argumentName: 'assigneeId',
      },
    ]);

    if (!nullGuard.succeeded) {
      return Result.fail<Task>(nullGuard.message);
    }

    return Result.ok<Task>(new Task(props, id));
  }

  public static note(description: Description, ownerId: OwnerId, assigneeId: AssigneeId): Result<Task> {
    return Task.create({
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
    });
  }

  public createSnapshot(): TaskSnapshot {
    return new TaskSnapshot(this.props, this.taskId);
  }

  public tickOff(assigneeId: AssigneeId): Result<void> {
    if (!this.memberMustBeTaskAssignee.satisfiedBy(assigneeId)) {
      return Result.fail('Only the assigned member can tick-off the task.');
    }
    this.props.tickedOff = true;
    this.props.tickedOffAt = new Date();
    return Result.ok();
  }

  public isTickedOff(): boolean {
    return this.props.tickedOff;
  }

  public resume(assigneeId: AssigneeId): Result<void> {
    if (!this.memberMustBeTaskAssignee.satisfiedBy(assigneeId)) {
      return Result.fail('Only the assigned member can resume the task.');
    }
    this.props.tickedOff = false;
    this.props.resumedAt = new Date();
    return Result.ok();
  }

  public archive(ownerId: OwnerId): Result<void> {
    if (!this.memberMustBeTaskOwner.satisfiedBy(ownerId)) {
      return Result.fail('Only the owner can archive the task.');
    }
    this.props.archived = true;
    this.props.archivedAt = new Date();
    return Result.ok();
  }

  public isArchived(): boolean {
    return this.props.archived;
  }

  public edit(newDescription: Description, ownerId: OwnerId): Result<void> {
    if (!this.memberMustBeTaskOwner.satisfiedBy(ownerId)) {
      return Result.fail('Only the task owner can edit the description.');
    }

    this.props.description = newDescription;
    this.props.editedAt = new Date();
    return Result.ok();
  }

  public discard(ownerId: OwnerId): Result<void> {
    if (!this.memberMustBeTaskOwner.satisfiedBy(ownerId)) {
      return Result.fail('Only the owner can discard the task.');
    }
    this.props.discarded = true;
    this.props.discardedAt = new Date();
    return Result.ok();
  }

  public isDiscarded(): boolean {
    return this.props.discarded;
  }

  public assign(ownerId: OwnerId, assigneeId: AssigneeId): Result<void> {
    if (!this.memberMustBeTaskOwner.satisfiedBy(ownerId)) {
      return Result.fail('Task is only assignable by task owner.');
    }

    if (!this.memberHasNotYetBeenAssigned.satisfiedBy(assigneeId)) {
      return Result.fail('Member is assigned already.');
    }

    this.props.assigneeId = assigneeId;
    return Result.ok();
  }
}
