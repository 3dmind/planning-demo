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
    return this.toArray()
      .filter((task) => task.ownerId.equals(ownerId))
      .filter((task) => !task.isArchived())
      .filter((task) => !task.isDiscarded());
  }

  public async getArchivedTasks(): Promise<Task[]> {
    return this.toArray().filter((task) => {
      return task.isArchived() && !task.isDiscarded();
    });
  }

  public async getAllArchivedTasksOfOwnerByOwnerId(
    ownerId: OwnerId,
  ): Promise<Task[]> {
    return this.toArray()
      .filter((task) => task.ownerId.equals(ownerId))
      .filter((task) => !task.isDiscarded())
      .filter((task) => task.isArchived());
  }

  public async getTaskOfOwnerByTaskId(
    ownerId: OwnerId,
    taskId: TaskId,
  ): Promise<MaybeTask> {
    const task = this.toArray()
      .filter((task) => task.ownerId.equals(ownerId))
      .find((task) => task.taskId.equals(taskId));
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
    return this.toArray();
  }

  public async save(task: Task): Promise<void> {
    this.tasks.set(task.taskId.id.toString(), task);
  }

  private toArray(): Task[] {
    return Array.from(this.tasks.values());
  }
}
