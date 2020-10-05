import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { TaskIdEntity } from './domain/task-id.entity';
import { TaskEntity } from './domain/task.entity';
import { TaskMapper } from './task.mapper';
import { TaskModel } from './task.model';

@Injectable()
export class TaskRepository {
  constructor(
    @InjectModel(TaskModel)
    private readonly taskModel: typeof TaskModel,
  ) {}

  async exists(taskId: TaskIdEntity): Promise<boolean> {
    const taskModel = await this.taskModel.findByPk(taskId.id.toString());
    return !!taskModel === true;
  }

  async save(task: TaskEntity): Promise<void> {
    const exists = await this.exists(task.taskId);
    const rawTaskModel = TaskMapper.toPersistence(task);

    if (!exists) {
      try {
        await this.taskModel.create(rawTaskModel);
      } catch (error) {
        throw new Error(error.toString());
      }
    } else {
      const taskModel = await this.taskModel.findByPk(
        task.taskId.id.toString(),
      );
      await taskModel.update(rawTaskModel);
    }
  }

  async getTasks(): Promise<TaskEntity[]> {
    const taskModels = await this.taskModel.findAll();
    return taskModels.map((model) => TaskMapper.toDomain(model));
  }

  async getTaskByTaskId(
    taskId: TaskIdEntity,
  ): Promise<{ found: boolean; task?: TaskEntity }> {
    const taskModel = await this.taskModel.findByPk(taskId.id.toString());
    const found = !!taskModel === true;

    if (found) {
      const task = TaskMapper.toDomain(taskModel);
      return { found, task };
    } else {
      return { found };
    }
  }

  async getActiveTasks(): Promise<TaskEntity[]> {
    const taskModels = await this.taskModel.findAll({
      where: {
        archived: false,
        discarded: false,
      },
    });
    return taskModels.map((model) => TaskMapper.toDomain(model));
  }
}
