import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { MemberEntityBuilder } from '../../../../../../test/builder/member-entity.builder';
import { AppErrors, Result } from '../../../../../shared/core';
import { UniqueEntityId } from '../../../../../shared/domain';
import { UserId } from '../../../../users/domain/user-id.entity';
import { Task } from '../../../domain/task.entity';
import { InMemoryMemberRepository } from '../../../repositories/member/in-memory-member.repository';
import { MemberRepository } from '../../../repositories/member/member.repository';
import { InMemoryTaskRepository } from '../../../repositories/task/in-memory-task.repository';
import { TaskRepository } from '../../../repositories/task/task.repository';
import { NoteTaskDto } from './note-task.dto';
import { NoteTaskErrors } from './note-task.errors';
import { NoteTaskUsecase } from './note-task.usecase';

describe('NoteTaskUsecase', () => {
  let memberRepository: MemberRepository;
  let taskRepository: TaskRepository;
  let useCase: NoteTaskUsecase;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: TaskRepository,
          useClass: InMemoryTaskRepository,
        },
        {
          provide: MemberRepository,
          useClass: InMemoryMemberRepository,
        },
        NoteTaskUsecase,
      ],
    }).compile();
    module.useLogger(false);

    memberRepository = module.get<MemberRepository>(MemberRepository);
    taskRepository = module.get<TaskRepository>(TaskRepository);
    useCase = module.get<NoteTaskUsecase>(NoteTaskUsecase);
  });

  it('should fail if Description cannot be created', async () => {
    // Given
    const dto: NoteTaskDto = { text: faker.lorem.words(0) };
    const userId = UserId.create(new UniqueEntityId()).getValue();

    // When
    const result = await useCase.execute({
      dto,
      userId,
    });

    // Then
    expect.assertions(1);
    expect(result.isLeft()).toBe(true);
  });

  it('should fail if member cannot be found', async () => {
    // Given
    const dto: NoteTaskDto = { text: faker.lorem.words(5) };
    const userId = UserId.create(new UniqueEntityId()).getValue();

    // When
    const result = await useCase.execute({
      dto,
      userId,
    });

    // Then
    expect.assertions(3);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(NoteTaskErrors.MemberNotFoundError);
    expect(result.value.errorValue().message).toEqual(
      `Could not find member associated with the user id {${userId}}.`,
    );
  });

  it('should fail if Task cannot be noted', async () => {
    // Given
    const spy = jest
      .spyOn(Task, 'note')
      .mockReturnValue(Result.fail<Task>('error'));
    const dto: NoteTaskDto = { text: faker.lorem.words(5) };
    const member = new MemberEntityBuilder().build();
    await memberRepository.save(member);

    // When
    const result = await useCase.execute({
      dto,
      userId: member.userId,
    });

    // Then
    expect.assertions(1);
    expect(result.isLeft()).toBe(true);

    spy.mockRestore();
  });

  it('should fail on any other error', async () => {
    // Given
    const spy = jest
      .spyOn(taskRepository, 'save')
      .mockImplementationOnce(() => {
        throw new Error();
      });
    const dto: NoteTaskDto = { text: faker.lorem.words(5) };
    const member = new MemberEntityBuilder().build();
    await memberRepository.save(member);

    // When
    const result = await useCase.execute({
      dto,
      userId: member.userId,
    });

    // Then
    expect.assertions(2);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should succeed', async () => {
    // Given
    const dto: NoteTaskDto = { text: faker.lorem.words(5) };
    const member = new MemberEntityBuilder().build();
    await memberRepository.save(member);

    // When
    const result = await useCase.execute({
      dto,
      userId: member.userId,
    });
    const task: Task = result.value.getValue();

    // Then
    expect.assertions(2);
    expect(result.isRight()).toBe(true);
    expect(task).toBeDefined();
  });
});
