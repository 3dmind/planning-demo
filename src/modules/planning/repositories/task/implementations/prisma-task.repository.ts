import { Injectable } from '@nestjs/common';
import { TaskModel } from '@prisma/client';
import { PrismaService } from '../../../../../prisma/prisma.service';
import { MemberId } from '../../../domain/member-id.entity';
import { TaskId } from '../../../domain/task-id.entity';
import { Task } from '../../../domain/task.entity';
import { MaybeTask, TaskRepository } from '../../../domain/task.repository';
import { TaskMapper } from '../../../mappers/task.mapper';

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

  public async getTaskById(taskId: TaskId): Promise<MaybeTask> {
    const taskModel = await this.prismaService.taskModel.findUnique({
      where: {
        taskId: taskId.toString(),
      },
    });
    const found = !!taskModel === true;

    if (found) {
      const task = TaskMapper.toDomain(taskModel);
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
    const taskModels: TaskModel[] = await this.prismaService.taskModel.findMany({
      where: {
        archived: false,
        discarded: false,
        OR: [
          {
            ownerId: memberId.toString(),
          },
          {
            assigneeId: memberId.toString(),
          },
        ],
      },
    });
    return taskModels.map((model) => TaskMapper.toDomain(model));
  }

  public async getAllArchivedTasksOfMember(memberId: MemberId): Promise<Task[]> {
    const taskModels: TaskModel[] = await this.prismaService.taskModel.findMany({
      where: {
        archived: true,
        discarded: false,
        ownerId: memberId.toString(),
      },
    });
    return taskModels.map((model) => TaskMapper.toDomain(model));
  }
}
