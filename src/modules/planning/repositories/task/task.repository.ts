import { MemberId } from '../../domain/member-id.entity';
import { OwnerId } from '../../domain/owner-id.entity';
import { TaskId } from '../../domain/task-id.entity';
import { Task } from '../../domain/task.entity';

export type MaybeTask = {
  found: boolean;
  task?: Task;
};

export abstract class TaskRepository {
  abstract exists(taskId: TaskId): Promise<boolean>;

  abstract getTaskById(taskId: TaskId): Promise<MaybeTask>;

  abstract getAllActiveTasksOfMember(memberId: MemberId): Promise<Task[]>;

  /**
   * @deprecated
   */
  abstract getArchivedTasks(): Promise<Task[]>;

  /**
   * @deprecated
   */
  abstract getAllArchivedTasksOfOwnerByOwnerId(
    ownerId: OwnerId,
  ): Promise<Task[]>;

  abstract getAllArchivedTasksOfMember(memberId: MemberId): Promise<Task[]>;

  /**
   * @deprecated
   */
  abstract getTaskOfOwnerByTaskId(
    ownerId: OwnerId,
    taskId: TaskId,
  ): Promise<MaybeTask>;

  abstract save(task: Task): Promise<void>;
}
