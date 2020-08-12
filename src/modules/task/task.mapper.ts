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
      tickedOffAt: taskSnapshot.tickedOffAt,
    };
  }

  public static toDomain(taskModel: TaskModel): Task {
    const id = new UniqueEntityID(taskModel.taskId);
    const descriptionResult = Description.create(taskModel.description);
    const taskResult = Task.create(
      {
        createdAt: taskModel.createdAt,
        description: descriptionResult.getValue(),
        tickedOff: taskModel.tickedOff,
        tickedOffAt: taskModel.tickedOffAt,
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
      tickedOffAt: taskSnapshot.tickedOffAt?.toISOString(),
    };
  }
}
