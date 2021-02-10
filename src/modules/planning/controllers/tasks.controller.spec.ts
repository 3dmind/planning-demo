import { Test, TestingModule } from '@nestjs/testing';
import { mock, mockReset } from 'jest-mock-extended';
import { ArchiveTaskUsecase } from '../use-cases/tasks/archive-task/archive-task.usecase';
import { AssignTaskUsecase } from '../use-cases/tasks/assign-task/assign-task.usecase';
import { DiscardTaskUsecase } from '../use-cases/tasks/discard-task/discard-task.usecase';
import { EditTaskUsecase } from '../use-cases/tasks/edit-task/edit-task.usecase';
import { GetAllActiveTasksUsecase } from '../use-cases/tasks/get-all-active-tasks/get-all-active-tasks.usecase';
import { GetAllArchivedTasksUsecase } from '../use-cases/tasks/get-all-archived-tasks/get-all-archived-tasks.usecase';
import { NoteTaskUsecase } from '../use-cases/tasks/note-task/note-task.usecase';
import { ResumeTaskUsecase } from '../use-cases/tasks/resume-task/resume-task.usecase';
import { TickOffTaskUsecase } from '../use-cases/tasks/tick-off-task/tick-off-task.usecase';
import { TasksController } from './tasks.controller';

describe('TasksController', () => {
  const mockedNoteTaskUseCase = mock<NoteTaskUsecase>();
  const mockedTickOffTaskUseCase = mock<TickOffTaskUsecase>();
  const mockedResumeTaskUseCase = mock<ResumeTaskUsecase>();
  const mockedArchiveTaskUseCase = mock<ArchiveTaskUsecase>();
  const mockedEditTaskUseCase = mock<EditTaskUsecase>();
  const mockedDiscardTaskUseCase = mock<DiscardTaskUsecase>();
  const mockedGetAllActiveTasksUseCase = mock<GetAllActiveTasksUsecase>();
  const mockedGetAllArchivedTasksUseCase = mock<GetAllArchivedTasksUsecase>();
  const mockedAssignTaskUsecase = mock<AssignTaskUsecase>();
  let controller: TasksController;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        { provide: NoteTaskUsecase, useValue: mockedNoteTaskUseCase },
        { provide: TickOffTaskUsecase, useValue: mockedTickOffTaskUseCase },
        { provide: ResumeTaskUsecase, useValue: mockedResumeTaskUseCase },
        { provide: ArchiveTaskUsecase, useValue: mockedArchiveTaskUseCase },
        { provide: EditTaskUsecase, useValue: mockedEditTaskUseCase },
        { provide: DiscardTaskUsecase, useValue: mockedDiscardTaskUseCase },
        {
          provide: GetAllActiveTasksUsecase,
          useValue: mockedGetAllActiveTasksUseCase,
        },
        {
          provide: GetAllArchivedTasksUsecase,
          useValue: mockedGetAllArchivedTasksUseCase,
        },
        {
          provide: AssignTaskUsecase,
          useValue: mockedAssignTaskUsecase,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  afterAll(() => {
    mockReset(mockedNoteTaskUseCase);
    mockReset(mockedTickOffTaskUseCase);
    mockReset(mockedResumeTaskUseCase);
    mockReset(mockedArchiveTaskUseCase);
    mockReset(mockedEditTaskUseCase);
    mockReset(mockedGetAllActiveTasksUseCase);
    mockReset(mockedGetAllArchivedTasksUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
