import { Description } from './description';
import { TaskId } from './task-id';
import { TaskProps } from './task-props';

interface TaskSnapshotProps {
  readonly createdAt: Date;
  readonly description: Description;
  readonly isTickedOff: boolean;
  readonly taskId: TaskId;
  readonly tickedOffAt?: Date;
}

export class TaskSnapshot implements TaskSnapshotProps {
  readonly createdAt: Date;
  readonly description: Description;
  readonly isTickedOff: boolean;
  readonly taskId: TaskId;
  readonly tickedOffAt?: Date;

  constructor(props: Readonly<TaskProps>, taskId: TaskId) {
    this.createdAt = props.createdAt;
    this.description = props.description;
    this.isTickedOff = props.tickedOff;
    this.taskId = taskId;
    this.tickedOffAt = props.tickedOffAt;

    Object.freeze(this);
  }
}
