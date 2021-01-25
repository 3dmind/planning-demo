import { OwnerId } from '../../domain/owner-id.entity';
import { TaskId } from '../../domain/task-id.entity';
import { Task } from '../../domain/task.entity';

export type MaybeTask = {
  found: boolean;
  task?: Task;
};

export abstract class TaskRepository {
  abstract exists(taskId: TaskId): Promise<boolean>;

  abstract getAllActiveTasksOfOwnerByOwnerId(ownerId: OwnerId): Promise<Task[]>;

  abstract getArchivedTasks(): Promise<Task[]>;

  abstract getAllArchivedTasksOfOwnerByOwnerId(
    ownerId: OwnerId,
  ): Promise<Task[]>;

  abstract getTaskOfOwnerByTaskId(
    ownerId: OwnerId,
    taskId: TaskId,
  ): Promise<MaybeTask>;

  abstract getTasks(): Promise<Task[]>;

  abstract save(task: Task): Promise<void>;
}
