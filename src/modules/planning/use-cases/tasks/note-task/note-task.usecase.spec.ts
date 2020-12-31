import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { AppErrors, Result } from '../../../../../shared/core';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../repositories/task.repository';
import { NoteTaskDto } from './note-task.dto';
import { NoteTaskUsecase } from './note-task.usecase';

describe('NoteTaskUsecase', () => {
  const mockedTaskRepository = mock<TaskRepository>();
  let noteTaskUseCase: NoteTaskUsecase;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: TaskRepository, useValue: mockedTaskRepository },
        NoteTaskUsecase,
      ],
    }).compile();
    module.useLogger(false);

    noteTaskUseCase = await module.resolve<NoteTaskUsecase>(NoteTaskUsecase);
  });

  afterAll(() => {
    mockReset(mockedTaskRepository);
  });

  it('should fail if Description cannot be created', async () => {
    expect.assertions(1);
    const text = faker.lorem.words(0);
    const request: NoteTaskDto = { text };

    const result = await noteTaskUseCase.execute(request);

    expect(result.isLeft()).toBe(true);
  });

  it('should fail if Task cannot be noted', async () => {
    expect.assertions(1);
    const spy = jest
      .spyOn(Task, 'note')
      .mockReturnValue(Result.fail<Task>('error'));
    const text = faker.lorem.words(5);
    const request: NoteTaskDto = { text };

    const result = await noteTaskUseCase.execute(request);

    expect(result.isLeft()).toBe(true);

    spy.mockRestore();
  });

  it('should fail on any other error', async () => {
    expect.assertions(2);
    const text = faker.lorem.words(5);
    const request: NoteTaskDto = { text };
    mockedTaskRepository.save.mockImplementationOnce(() => {
      throw new Error();
    });

    const result = await noteTaskUseCase.execute(request);

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);
  });

  it('should succeed', async () => {
    expect.assertions(2);
    const text = faker.lorem.words(5);
    const request: NoteTaskDto = { text };

    const result = await noteTaskUseCase.execute(request);
    const task: Task = result.value.getValue();

    expect(result.isRight()).toBe(true);
    expect(task).toBeDefined();
  });
});
