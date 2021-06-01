import { Injectable } from '@nestjs/common';
import { MemberId } from '../../../domain/member-id.entity';
import { TaskId } from '../../../domain/task-id.entity';
import { Task } from '../../../domain/task.entity';
import { MaybeTask, TaskRepository } from '../../../domain/task.repository';

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
  private readonly tasks = new Map<string, Task>();

  constructor() {
    super();
  }

  public async exists(taskId: TaskId): Promise<boolean> {
    return this.tasks.has(taskId.toString());
  }

  public async save(task: Task): Promise<void> {
    this.tasks.set(task.taskId.toString(), task);
  }

  public async getTaskById(taskId: TaskId): Promise<MaybeTask> {
    const found = this.tasks.has(taskId.toString());
    if (found) {
      const task = this.tasks.get(taskId.toString());
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

  public async getAllActiveTasksOfMember(memberId: MemberId): Promise<Task[]> {
    return this.toArray()
      .filter((task) => {
        return task.ownerId.equals(memberId) || task.assigneeId.equals(memberId);
      })
      .filter((task) => !task.isArchived())
      .filter((task) => !task.isDiscarded());
  }

  public async getAllArchivedTasksOfMember(memberId: MemberId): Promise<Task[]> {
    return this.toArray()
      .filter((task) => task.ownerId.equals(memberId))
      .filter((task) => !task.isDiscarded())
      .filter((task) => task.isArchived());
  }

  private toArray(): Task[] {
    return Array.from(this.tasks.values());
  }
}
