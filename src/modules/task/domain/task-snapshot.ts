import { DescriptionValueObject } from './description.value-object';
import { TaskIdEntity } from './task-id.entity';
import { TaskPropsInterface } from './task-props.interface';

export class TaskSnapshot {
  readonly createdAt: Date;
  readonly description: DescriptionValueObject;
  readonly isTickedOff: boolean;
  readonly resumedAt: Date;
  readonly taskId: TaskIdEntity;
  readonly tickedOffAt: Date;

  constructor(props: Readonly<TaskPropsInterface>, taskId: TaskIdEntity) {
    const { createdAt, description, resumedAt, tickedOff, tickedOffAt } = props;
    this.createdAt = createdAt;
    this.description = description;
    this.isTickedOff = tickedOff;
    this.resumedAt = resumedAt;
    this.taskId = taskId;
    this.tickedOffAt = tickedOffAt;

    Object.freeze(this);
  }
}
