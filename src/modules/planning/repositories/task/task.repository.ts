import { TaskId } from '../../domain/task-id.entity';
import { Task } from '../../domain/task.entity';

export abstract class TaskRepository {
  abstract async exists(taskId: TaskId): Promise<boolean>;

  abstract async getActiveTasks(): Promise<Task[]>;

  abstract async getArchivedTasks(): Promise<Task[]>;

  abstract async getTaskByTaskId(
    taskId: TaskId,
  ): Promise<{ found: boolean; task?: Task }>;

  abstract async getTasks(): Promise<Task[]>;

  abstract async save(task: Task): Promise<void>;
}
