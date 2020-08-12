import { Test, TestingModule } from '@nestjs/testing';
import { mock, mockReset } from 'jest-mock-extended';
import { TaskController } from './task.controller';
import { GetAllTasksUseCase } from './use-cases/get-all-tasks/get-all-tasks.use-case';
import { NoteTaskUseCase } from './use-cases/note-task/note-task.use-case';

describe('TaskController', () => {
  const mockedGetAllTasksUseCase = mock<GetAllTasksUseCase>();
  const mockedNoteTaskUseCase = mock<NoteTaskUseCase>();
  let controller: TaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        { provide: GetAllTasksUseCase, useValue: mockedGetAllTasksUseCase },
        { provide: NoteTaskUseCase, useValue: mockedNoteTaskUseCase },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
  });

  afterAll(() => {
    mockReset(mockedGetAllTasksUseCase);
    mockReset(mockedNoteTaskUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
