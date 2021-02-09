import { Prisma, TaskModel } from '@prisma/client';
import { UniqueEntityId } from '../../../shared/domain';
import { AssigneeId } from '../domain/assignee-id.entity';
import { Description } from '../domain/description.valueobject';
import { OwnerId } from '../domain/owner-id.entity';
import { Task } from '../domain/task.entity';
import { TaskDto } from '../dtos/task.dto';

export class TaskMapper {
  public static toPersistence(task: Task): Prisma.TaskModelCreateInput {
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
      ownerModel: {
        connect: {
          memberId: taskSnapshot.ownerId.id.toString(),
        },
      },
      assigneeModel: {
        connect: {
          memberId: taskSnapshot.assigneeId.id.toString(),
        },
      },
    };
  }

  public static toDomain(taskModel: TaskModel): Task {
    const id = new UniqueEntityId(taskModel.taskId);
    const descriptionResult = Description.create(taskModel.description);
    const ownerIdResult = OwnerId.create(new UniqueEntityId(taskModel.ownerId));
    const assigneeIdResult = AssigneeId.create(
      new UniqueEntityId(taskModel.assigneeId),
    );
    const taskResult = Task.create(
      {
        archived: taskModel.archived,
        archivedAt: taskModel.archivedAt,
        assigneeId: assigneeIdResult.getValue(),
        createdAt: taskModel.createdAt,
        description: descriptionResult.getValue(),
        discarded: taskModel.discarded,
        discardedAt: taskModel.discardedAt,
        editedAt: taskModel.editedAt,
        ownerId: ownerIdResult.getValue(),
        resumedAt: taskModel.resumedAt,
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
