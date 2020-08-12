import { UniqueEntityID } from '../../shared/domain';
import { Description } from './domain/description';
import { Task } from './domain/task';
import { TaskDto } from './task.dto';
import { TaskModel } from './task.model';

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

  public static toDomain(taskModel: TaskModel): Task {
    const { tickedOff, taskId, description, createdAt } = taskModel;
    const id = new UniqueEntityID(taskId);
    const descriptionResult = Description.create(description);
    const taskResult = Task.create(
      {
        createdAt: createdAt,
        description: descriptionResult.getValue(),
        tickedOff: tickedOff,
      },
      id,
    );
    return taskResult.getValue();
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
