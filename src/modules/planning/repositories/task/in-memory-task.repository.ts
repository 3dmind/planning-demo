import { Injectable } from '@nestjs/common';
import { OwnerId } from '../../domain/owner-id.entity';
import { TaskId } from '../../domain/task-id.entity';
import { Task } from '../../domain/task.entity';
import { MaybeTask, TaskRepository } from './task.repository';

/**
 * In-memory implementation of the task repository.
 * Use for test purposes only!
 * @example
 * Test.createTestingModule({
 *   providers: [{
 *     provide: TaskRepository,
 *     useClass: InMemoryTaskRepository,
 *   }]
 * })
 */
@Injectable()
export class InMemoryTaskRepository extends TaskRepository {
  private tasks = new Map<string, Task>();

  constructor() {
    super();
  }

  public async exists(taskId: TaskId): Promise<boolean> {
    return this.tasks.has(taskId.id.toString());
  }

  public async getAllActiveTasksOfOwnerByOwnerId(
    ownerId: OwnerId,
  ): Promise<Task[]> {
    const tasks = Array.from(this.tasks.values());
    return tasks.filter((task) => {
      return (
        task.ownerId.equals(ownerId) &&
        !task.isArchived() &&
        !task.isDiscarded()
      );
    });
  }

  public async getArchivedTasks(): Promise<Task[]> {
    const tasks = Array.from(this.tasks.values());
    return tasks.filter((task) => {
      return task.isArchived() && !task.isDiscarded();
    });
  }

  public async getTaskOfOwnerByTaskId(
    ownerId: OwnerId,
    taskId: TaskId,
  ): Promise<MaybeTask> {
    const task = Array.from(this.tasks.values()).find((task) => {
      return task.ownerId.equals(ownerId) && task.taskId.equals(taskId);
    });
    const found = !!task === true;

    if (found) {
      return {
        found,
        task,
      };
    } else {
      return {
        found,
      };
    }
  }

  public async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  public async save(task: Task): Promise<void> {
    this.tasks.set(task.taskId.id.toString(), task);
  }
}
