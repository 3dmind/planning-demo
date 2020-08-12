import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Task } from './domain/task';
import { TaskId } from './domain/task-id';
import { TaskMapper } from './task.mapper';
import { TaskModel } from './task.model';

@Injectable()
export class TaskRepository {
  constructor(
    @InjectModel(TaskModel)
    private readonly taskModel: typeof TaskModel,
  ) {}

  async exists(taskId: TaskId): Promise<boolean> {
    const taskModel = await this.taskModel.findOne({
      where: { task_id: taskId.id.toString() },
    });
    return !!taskModel === true;
  }

  async save(task: Task): Promise<void> {
    const exists = await this.exists(task.taskId);
    const rawTaskModel = TaskMapper.toPersistence(task);

    if (!exists) {
      try {
        await this.taskModel.create(rawTaskModel);
      } catch (error) {
        throw new Error(error.toString());
      }
    } else {
      const taskModel = await this.taskModel.findOne({
        where: { task_id: task.taskId.id.toString() },
      });
      await taskModel.update(rawTaskModel);
    }
  }

  async getTasks(): Promise<Task[]> {
    const taskModels = await this.taskModel.findAll();
    return taskModels.map((model) => TaskMapper.toDomain(model));
  }

  async getTaskByTaskId(taskId: TaskId): Promise<[boolean, Task?]> {
    const taskModel = await this.taskModel.findOne({
      where: { task_id: taskId.id.toString() },
    });
    const found = !!taskModel === true;

    if (found) {
      const task = TaskMapper.toDomain(taskModel);
      return [found, task];
    } else {
      return [found];
    }
  }
}
