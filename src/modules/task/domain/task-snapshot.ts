import { Description } from './description';
import { TaskId } from './task-id';
import { TaskProps } from './task-props';

interface TaskSnapshotProps {
  readonly createdAt: Date;
  readonly description: Description;
  readonly isTickedOff: boolean;
  readonly taskId: TaskId;
}

export class TaskSnapshot implements TaskSnapshotProps {
  readonly createdAt: Date;
  readonly description: Description;
  readonly isTickedOff: boolean;
  readonly taskId: TaskId;

  constructor(props: Readonly<TaskProps>, taskId: TaskId) {
    this.createdAt = props.createdAt;
    this.description = props.description;
    this.isTickedOff = props.tickedOff;
    this.taskId = taskId;

    Object.freeze(this);
  }
}
