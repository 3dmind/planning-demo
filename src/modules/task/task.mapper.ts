import type { TaskModel, TaskModelCreateInput } from '@prisma/client';
import { UniqueEntityId } from '../../shared/domain';
import { DescriptionValueObject } from './domain/description.value-object';
import { TaskEntity } from './domain/task.entity';
import { TaskDto } from './task.dto';

export class TaskMapper {
  public static toPersistence(task: TaskEntity): TaskModelCreateInput {
    const taskSnapshot = task.createSnapshot();
    return {
      archived: taskSnapshot.isArchived,
      archivedAt: taskSnapshot.archivedAt,
      createdAt: taskSnapshot.createdAt,
      description: taskSnapshot.description.value,
      discarded: taskSnapshot.isDiscarded,
      discardedAt: taskSnapshot.discardedAt,
      editedAt: taskSnapshot.editedAt,
      resumedAt: taskSnapshot.resumedAt,
      taskId: taskSnapshot.taskId.id.toString(),
      tickedOff: taskSnapshot.isTickedOff,
      tickedOffAt: taskSnapshot.tickedOffAt,
    };
  }

  public static toDomain(taskModel: TaskModel): TaskEntity {
    const id = new UniqueEntityId(taskModel.taskId);
    const descriptionResult = DescriptionValueObject.create(
      taskModel.description,
    );
    const taskResult = TaskEntity.create(
      {
        archived: taskModel.archived,
        archivedAt: taskModel.archivedAt,
        createdAt: taskModel.createdAt,
        description: descriptionResult.getValue(),
        discarded: taskModel.discarded,
        discardedAt: taskModel.discardedAt,
        editedAt: taskModel.editedAt,
        resumedAt: taskModel.resumedAt,
        tickedOff: taskModel.tickedOff,
        tickedOffAt: taskModel.tickedOffAt,
      },
      id,
    );
    return taskResult.getValue();
  }

  public static toDto(task: TaskEntity): TaskDto {
    const taskSnapshot = task.createSnapshot();
    return {
      archivedAt: taskSnapshot.archivedAt?.toISOString() ?? null,
      createdAt: taskSnapshot.createdAt.toISOString(),
      description: taskSnapshot.description.value,
      discardedAt: taskSnapshot.discardedAt?.toISOString() ?? null,
      editedAt: taskSnapshot.editedAt?.toISOString() ?? null,
      id: taskSnapshot.taskId.id.toString(),
      isArchived: taskSnapshot.isArchived,
      isDiscarded: taskSnapshot.isDiscarded,
      isTickedOff: taskSnapshot.isTickedOff,
      resumedAt: taskSnapshot.resumedAt?.toISOString() ?? null,
      tickedOffAt: taskSnapshot.tickedOffAt?.toISOString() ?? null,
    };
  }
}
