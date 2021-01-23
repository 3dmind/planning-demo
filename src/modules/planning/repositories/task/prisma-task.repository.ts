import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../prisma/prisma.service';
import { OwnerId } from '../../domain/owner-id.entity';
import { TaskId } from '../../domain/task-id.entity';
import { Task } from '../../domain/task.entity';
import { TaskMapper } from '../../mappers/task.mapper';
import { MaybeTask, TaskRepository } from './task.repository';

@Injectable()
export class PrismaTaskRepository extends TaskRepository {
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async exists(taskId: TaskId): Promise<boolean> {
    const taskModel = await this.prismaService.taskModel.findUnique({
      where: {
        taskId: taskId.id.toString(),
      },
    });
    return !!taskModel === true;
  }

  public async getAllActiveTasksOfOwnerByOwnerId(
    ownerId: OwnerId,
  ): Promise<Task[]> {
    const taskModels = await this.prismaService.taskModel.findMany({
      where: {
        ownerId: ownerId.id.toString(),
        archived: false,
        discarded: false,
      },
    });
    return taskModels.map((model) => TaskMapper.toDomain(model));
  }

  async getArchivedTasks(): Promise<Task[]> {
    const taskModels = await this.prismaService.taskModel.findMany({
      where: {
        archived: true,
        discarded: false,
      },
    });
    return taskModels.map((model) => TaskMapper.toDomain(model));
  }

  public async getTaskOfOwnerByTaskId(
    ownerId: OwnerId,
    taskId: TaskId,
  ): Promise<MaybeTask> {
    const taskModel = await this.prismaService.taskModel.findFirst({
      where: {
        taskId: taskId.id.toString(),
        ownerId: ownerId.id.toString(),
      },
    });
    const found = !!taskModel === true;

    if (found) {
      const task = TaskMapper.toDomain(taskModel);
      return { found, task };
    } else {
      return { found };
    }
  }

  async getTasks(): Promise<Task[]> {
    const taskModels = await this.prismaService.taskModel.findMany();
    return taskModels.map((model) => TaskMapper.toDomain(model));
  }

  async save(task: Task): Promise<void> {
    const exists = await this.exists(task.taskId);
    const rawTaskModel = TaskMapper.toPersistence(task);

    if (!exists) {
      try {
        await this.prismaService.taskModel.create({
          data: rawTaskModel,
        });
      } catch (error) {
        throw new Error(error.toString());
      }
    } else {
      await this.prismaService.taskModel.update({
        where: {
          taskId: task.taskId.id.toString(),
        },
        data: rawTaskModel,
      });
    }
  }
}
