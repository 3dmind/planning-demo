import { Test, TestingModule } from '@nestjs/testing';
import { MemberEntityBuilder } from '../../../../../../test/builder/member-entity.builder';
import { TaskEntityBuilder } from '../../../../../../test/builder/task-entity.builder';
import { AppErrors } from '../../../../../shared/core';
import { TaskRepository } from '../../../domain/task.repository';
import { InMemoryTaskRepository } from '../../../repositories/task/implementations/in-memory-task.repository';
import { GetAllArchivedTasksUsecase } from './get-all-archived-tasks.usecase';

describe('GetAllArchivedTasksUsecase', () => {
  let taskRepository: TaskRepository;
  let useCase: GetAllArchivedTasksUsecase;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TaskRepository,
          useClass: InMemoryTaskRepository,
        },
        GetAllArchivedTasksUsecase,
      ],
    }).compile();
    module.useLogger(false);

    taskRepository = module.get<TaskRepository>(TaskRepository);
    useCase = module.get<GetAllArchivedTasksUsecase>(GetAllArchivedTasksUsecase);
  });

  it('should fail on any error', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const spy = jest.spyOn(taskRepository, 'getAllArchivedTasksOfMember').mockImplementationOnce(() => {
      throw new Error();
    });

    // When
    const result = await useCase.execute({ member });

    // Then
    expect.assertions(2);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should succeed', async () => {
    // Given
    const memberOne = new MemberEntityBuilder().build();
    const memberTwo = new MemberEntityBuilder().build();
    const notedTaskOfMemberOne = new TaskEntityBuilder().withOwnerId(memberOne.ownerId).build();
    const tickedOffTaskOfMemberOne = new TaskEntityBuilder().withOwnerId(memberOne.ownerId).makeTickedOff().build();
    const archivedTaskOfMemberOne = new TaskEntityBuilder().withOwnerId(memberOne.ownerId).makeArchived().build();
    const discardedTaskOfMemberOne = new TaskEntityBuilder().withOwnerId(memberOne.ownerId).makeDiscarded().build();
    const notedTaskOfMemberTwo = new TaskEntityBuilder().withOwnerId(memberTwo.ownerId).build();
    await taskRepository.save(notedTaskOfMemberOne);
    await taskRepository.save(tickedOffTaskOfMemberOne);
    await taskRepository.save(archivedTaskOfMemberOne);
    await taskRepository.save(discardedTaskOfMemberOne);
    await taskRepository.save(notedTaskOfMemberTwo);

    // When
    const result = await useCase.execute({
      member: memberOne,
    });
    const tasks = result.value.getValue();

    // Then
    expect.assertions(6);
    expect(result.isRight()).toBe(true);
    expect(tasks).toContain(archivedTaskOfMemberOne);
    expect(tasks).not.toContain(notedTaskOfMemberOne);
    expect(tasks).not.toContain(tickedOffTaskOfMemberOne);
    expect(tasks).not.toContain(discardedTaskOfMemberOne);
    expect(tasks).not.toContain(notedTaskOfMemberTwo);
  });
});
