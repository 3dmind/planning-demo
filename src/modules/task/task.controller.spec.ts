import { Test, TestingModule } from '@nestjs/testing';
import { mock, mockReset } from 'jest-mock-extended';
import { TaskController } from './task.controller';
import { NoteTaskUseCase } from './use-cases/note-task/note-task.use-case';

describe('Task Controller', () => {
  const mockedNoteTaskUseCase = mock<NoteTaskUseCase>();
  let controller: TaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: NoteTaskUseCase,
          useValue: mockedNoteTaskUseCase,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
  });

  afterAll(() => {
    mockReset(mockedNoteTaskUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
