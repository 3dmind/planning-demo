import { Test, TestingModule } from '@nestjs/testing';
import { mock, mockReset } from 'jest-mock-extended';
import { TaskController } from './task.controller';
import { GetAllTasksUseCase } from './use-cases/get-all-tasks/get-all-tasks.use-case';
import { NoteTaskUseCase } from './use-cases/note-task/note-task.use-case';
import { TickOffTaskUseCase } from './use-cases/tick-off-task/tick-off-task.use-case';

describe('TaskController', () => {
  const mockedGetAllTasksUseCase = mock<GetAllTasksUseCase>();
  const mockedNoteTaskUseCase = mock<NoteTaskUseCase>();
  const mockedTickOffTaskUseCase = mock<TickOffTaskUseCase>();
  let controller: TaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        { provide: GetAllTasksUseCase, useValue: mockedGetAllTasksUseCase },
        { provide: NoteTaskUseCase, useValue: mockedNoteTaskUseCase },
        { provide: TickOffTaskUseCase, useValue: mockedTickOffTaskUseCase },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
  });

  afterAll(() => {
    mockReset(mockedGetAllTasksUseCase);
    mockReset(mockedNoteTaskUseCase);
    mockReset(mockedTickOffTaskUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
