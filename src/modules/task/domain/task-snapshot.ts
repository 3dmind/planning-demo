import { DescriptionValueObject } from './description.value-object';
import { TaskIdEntity } from './task-id.entity';
import { TaskPropsInterface } from './task-props.interface';

export class TaskSnapshot {
  readonly archivedAt: Date;
  readonly createdAt: Date;
  readonly description: DescriptionValueObject;
  readonly discardedAt: Date;
  readonly editedAt: Date;
  readonly isArchived: boolean;
  readonly isDiscarded: boolean;
  readonly isTickedOff: boolean;
  readonly resumedAt: Date;
  readonly taskId: TaskIdEntity;
  readonly tickedOffAt: Date;

  constructor(props: Readonly<TaskPropsInterface>, taskId: TaskIdEntity) {
    const {
      archived,
      archivedAt,
      createdAt,
      description,
      discarded,
      discardedAt,
      editedAt,
      resumedAt,
      tickedOff,
      tickedOffAt,
    } = props;
    this.archivedAt = archivedAt;
    this.createdAt = createdAt;
    this.description = description;
    this.discardedAt = discardedAt;
    this.editedAt = editedAt;
    this.isArchived = archived;
    this.isDiscarded = discarded;
    this.isTickedOff = tickedOff;
    this.resumedAt = resumedAt;
    this.taskId = taskId;
    this.tickedOffAt = tickedOffAt;

    Object.freeze(this);
  }
}
