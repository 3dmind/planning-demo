import { Task } from './domain/task';
import { TaskDto } from './task.dto';

export class TaskMapper {
  public static toPersistence(task: Task): any {
    const taskSnapshot = task.createSnapshot();
    return {
      createdAt: taskSnapshot.createdAt,
      description: taskSnapshot.description.value,
      taskId: taskSnapshot.taskId.id.toString(),
      tickedOff: taskSnapshot.isTickedOff,
    };
  }

  public static toDto(task: Task): TaskDto {
    const taskSnapshot = task.createSnapshot();
    return {
      createdAt: taskSnapshot.createdAt.toISOString(),
      description: taskSnapshot.description.value,
      id: taskSnapshot.taskId.id.toString(),
      isTickedOff: taskSnapshot.isTickedOff,
    };
  }
}
