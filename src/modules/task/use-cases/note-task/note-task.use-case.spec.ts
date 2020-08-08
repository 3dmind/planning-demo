import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { Result } from '../../../../shared/core';
import { Task } from '../../domain/task';
import { TaskRepository } from '../../task.repository';
import { NoteTaskDto } from './note-task.dto';
import { NoteTaskUseCase } from './note-task.use-case';

describe('Note Task Use Case', () => {
  const mockedLogger = mock<Logger>();
  const mockedTaskRepository = mock<TaskRepository>();
  let noteTaskUseCase: NoteTaskUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        { provide: Logger, useValue: mockedLogger },
        { provide: TaskRepository, useValue: mockedTaskRepository },
        NoteTaskUseCase,
      ],
    }).compile();

    noteTaskUseCase = await module.resolve<NoteTaskUseCase>(NoteTaskUseCase);
  });

  afterAll(() => {
    mockReset(mockedLogger);
    mockReset(mockedTaskRepository);
  });

  it('should fail if Description cannot be created', async () => {
    const text = faker.lorem.words(0);
    const noteTaskDto: NoteTaskDto = { text };

    const result = await noteTaskUseCase.execute(noteTaskDto);

    expect(result.isLeft()).toBe(true);
  });

  it('should fail if Task cannot be noted', async () => {
    const spy = jest
      .spyOn(Task, 'note')
      .mockReturnValue(Result.fail<Task>('error'));
    const text = faker.lorem.words(5);
    const noteTaskDto: NoteTaskDto = { text };

    const result = await noteTaskUseCase.execute(noteTaskDto);

    expect(result.isLeft()).toBe(true);

    spy.mockRestore();
  });

  it('should fail on any other error', async () => {
    const spy = jest.spyOn(Task, 'note').mockImplementation(() => {
      throw new Error();
    });
    const text = faker.lorem.words(5);
    const noteTaskDto: NoteTaskDto = { text };
    const result = await noteTaskUseCase.execute(noteTaskDto);

    expect(result.isLeft()).toBe(true);

    spy.mockRestore();
  });

  it('should succeed', async () => {
    const text = faker.lorem.words(5);
    const noteTaskDto: NoteTaskDto = { text };

    const result = await noteTaskUseCase.execute(noteTaskDto);
    const task: Task = result.value.getValue();

    expect(result.isRight()).toBe(true);
    expect(task).toBeDefined();
  });
});
