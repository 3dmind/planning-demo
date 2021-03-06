import { MemberId } from '../../domain/member-id.entity';
import { TaskId } from '../../domain/task-id.entity';
import { Task } from '../../domain/task.entity';

export type MaybeTask = {
  found: boolean;
  task?: Task;
};

export abstract class TaskRepository {
  abstract exists(taskId: TaskId): Promise<boolean>;

  abstract save(task: Task): Promise<void>;

  abstract getTaskById(taskId: TaskId): Promise<MaybeTask>;

  abstract getAllActiveTasksOfMember(memberId: MemberId): Promise<Task[]>;

  abstract getAllArchivedTasksOfMember(memberId: MemberId): Promise<Task[]>;
}
