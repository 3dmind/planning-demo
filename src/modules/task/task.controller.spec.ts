import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mock, mockReset } from 'jest-mock-extended';
import { TaskController } from './task.controller';
import { ArchiveTaskUseCase } from './use-cases/archive-task/archive-task.use-case';
import { DiscardTaskUseCase } from './use-cases/discard-task/discard-task.use-case';
import { EditTaskUseCase } from './use-cases/edit-task/edit-task.use-case';
import { GetAllTasksUseCase } from './use-cases/get-all-tasks/get-all-tasks.use-case';
import { NoteTaskUseCase } from './use-cases/note-task/note-task.use-case';
import { ResumeTaskUseCase } from './use-cases/resume-task/resume-task.use-case';
import { TickOffTaskUseCase } from './use-cases/tick-off-task/tick-off-task.use-case';

describe('TaskController', () => {
  const mockedLogger = mock<Logger>();
  const mockedGetAllTasksUseCase = mock<GetAllTasksUseCase>();
  const mockedNoteTaskUseCase = mock<NoteTaskUseCase>();
  const mockedTickOffTaskUseCase = mock<TickOffTaskUseCase>();
  const mockedResumeTaskUseCase = mock<ResumeTaskUseCase>();
  const mockedArchiveTaskUseCase = mock<ArchiveTaskUseCase>();
  const mockedEditTaskUseCase = mock<EditTaskUseCase>();
  const mockedDiscardTaskUseCase = mock<DiscardTaskUseCase>();
  let controller: TaskController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        { provide: Logger, useValue: mockedLogger },
        { provide: GetAllTasksUseCase, useValue: mockedGetAllTasksUseCase },
        { provide: NoteTaskUseCase, useValue: mockedNoteTaskUseCase },
        { provide: TickOffTaskUseCase, useValue: mockedTickOffTaskUseCase },
        { provide: ResumeTaskUseCase, useValue: mockedResumeTaskUseCase },
        { provide: ArchiveTaskUseCase, useValue: mockedArchiveTaskUseCase },
        { provide: EditTaskUseCase, useValue: mockedEditTaskUseCase },
        { provide: DiscardTaskUseCase, useValue: mockedDiscardTaskUseCase },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
  });

  afterAll(() => {
    mockReset(mockedLogger);
    mockReset(mockedGetAllTasksUseCase);
    mockReset(mockedNoteTaskUseCase);
    mockReset(mockedTickOffTaskUseCase);
    mockReset(mockedResumeTaskUseCase);
    mockReset(mockedArchiveTaskUseCase);
    mockReset(mockedEditTaskUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
