import { Test, TestingModule } from '@nestjs/testing';
import { MemberEntityBuilder } from '../../../../../../test/builder/member-entity.builder';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors } from '../../../../../shared/core';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../domain/task.repository';
import { InMemoryTaskRepository } from '../../../repositories/task/implementations/in-memory-task.repository';
import { ArchiveTaskUseCase } from './archive-task.use-case';

describe('ArchiveTaskUseCase', () => {
  let taskRepository: TaskRepository;
  let useCase: ArchiveTaskUseCase;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TaskRepository,
          useClass: InMemoryTaskRepository,
        },
        ArchiveTaskUseCase,
      ],
    }).compile();
    module.useLogger(false);

    taskRepository = module.get<TaskRepository>(TaskRepository);
    useCase = module.get<ArchiveTaskUseCase>(ArchiveTaskUseCase);
  });

  it('should fail if member is not the task owner', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().build();

    // When
    const result = await useCase.execute({ member, task });

    // Then
    expect.assertions(1);
    expect(result.isLeft()).toBe(true);
  });

  it('should fail on any other error', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(member.ownerId).build();
    const spy = jest.spyOn(taskRepository, 'save').mockImplementationOnce(() => {
      throw new Error();
    });

    // When
    const result = await useCase.execute({ member, task });

    // Then
    expect.assertions(2);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should not archive a task which is already archived', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(member.ownerId).makeArchived().build();
    const saveSpy = jest.spyOn(taskRepository, 'save');
    const archiveSpy = jest.spyOn(task, 'archive');

    // When
    const result = await useCase.execute({ member, task });
    const archivedTask: Task = result.value.getValue();

    // Then
    expect.assertions(4);
    expect(result.isRight()).toBe(true);
    expect(archivedTask.isArchived()).toBe(true);
    expect(archiveSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();

    archiveSpy.mockRestore();
    saveSpy.mockRestore();
  });

  it('should succeed', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(member.ownerId).build();

    // When
    const result = await useCase.execute({ member, task });
    const archivedTask: Task = result.value.getValue();

    // Then
    expect.assertions(2);
    expect(result.isRight()).toBe(true);
    expect(archivedTask.isArchived()).toBe(true);
  });
});
