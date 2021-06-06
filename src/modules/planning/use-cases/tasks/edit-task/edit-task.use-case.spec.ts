import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { MemberEntityBuilder } from '../../../../../../test/builder/member-entity.builder';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors } from '../../../../../shared/core';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../domain/task.repository';
import { InMemoryTaskRepository } from '../../../repositories/task/implementations/in-memory-task.repository';
import { EditTaskDto } from './edit-task.dto';
import { EditTaskUseCase } from './edit-task.use-case';

describe('EditTaskUseCase', () => {
  let taskRepository: TaskRepository;
  let useCase: EditTaskUseCase;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TaskRepository,
          useClass: InMemoryTaskRepository,
        },
        EditTaskUseCase,
      ],
    }).compile();
    module.useLogger(false);

    taskRepository = module.get<TaskRepository>(TaskRepository);
    useCase = module.get<EditTaskUseCase>(EditTaskUseCase);
  });

  it('should fail if new description cannot be created', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(member.ownerId).build();
    const dto: EditTaskDto = { text: '' };

    // When
    const result = await useCase.execute({ dto, member, task });

    // Then
    expect.assertions(2);
    expect(result.isLeft()).toBe(true);
    expect(result.value.errorValue()).toContain('Text is not at least 2 chars.');
  });

  it('should fail if member is not the task owner', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().build();
    const dto: EditTaskDto = { text: faker.lorem.words(5) };

    // When
    const result = await useCase.execute({ dto, member, task });

    // Then
    expect.assertions(1);
    expect(result.isLeft()).toBe(true);
  });

  it('should fail on any other error', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(member.ownerId).build();
    const dto: EditTaskDto = { text: faker.lorem.words(5) };
    const spy = jest.spyOn(taskRepository, 'save').mockImplementationOnce(() => {
      throw new Error();
    });

    // When
    const result = await useCase.execute({ dto, member, task });

    // Then
    expect.assertions(2);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should not edit description if the task already has this description', async () => {
    // Given
    const text = faker.lorem.words(5);
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withDescription(text).withOwnerId(member.ownerId).build();
    const dto: EditTaskDto = { text };
    const saveSpy = jest.spyOn(taskRepository, 'save');
    const editSpy = jest.spyOn(task, 'edit');

    // When
    const result = await useCase.execute({ dto, member, task });

    // Then
    expect.assertions(3);
    expect(result.isRight()).toBe(true);
    expect(editSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
  });

  it('should succeed', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const task = new TaskEntityBuilder().withOwnerId(member.ownerId).build();
    const dto: EditTaskDto = { text: faker.lorem.words(5) };

    // When
    const result = await useCase.execute({ dto, member, task });
    const editedTask: Task = result.value.getValue();

    // Then
    expect.assertions(2);
    expect(result.isRight()).toBe(true);
    expect(editedTask.props.description.value).toBe(dto.text);
  });
});
