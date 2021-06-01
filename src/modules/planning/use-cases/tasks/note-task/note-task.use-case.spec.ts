import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { MemberEntityBuilder } from '../../../../../../test/builder/member-entity.builder';
import { AppErrors, Result } from '../../../../../shared/core';
import { MemberRepository } from '../../../domain/member.repository';
import { Task } from '../../../domain/task.entity';
import { TaskRepository } from '../../../domain/task.repository';
import { InMemoryMemberRepository } from '../../../repositories/member/implementations/in-memory-member.repository';
import { InMemoryTaskRepository } from '../../../repositories/task/implementations/in-memory-task.repository';
import { NoteTaskDto } from './note-task.dto';
import { NoteTaskUseCase } from './note-task.use-case';

describe('NoteTaskUseCase', () => {
  let memberRepository: MemberRepository;
  let taskRepository: TaskRepository;
  let useCase: NoteTaskUseCase;

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
        NoteTaskUseCase,
      ],
    }).compile();
    module.useLogger(false);

    memberRepository = module.get<MemberRepository>(MemberRepository);
    taskRepository = module.get<TaskRepository>(TaskRepository);
    useCase = module.get<NoteTaskUseCase>(NoteTaskUseCase);
  });

  it('should fail if Description cannot be created', async () => {
    // Given
    const member = new MemberEntityBuilder().build();
    const dto: NoteTaskDto = { text: faker.lorem.words(0) };

    // When
    const result = await useCase.execute({
      dto,
      member,
    });

    // Then
    expect.assertions(1);
    expect(result.isLeft()).toBe(true);
  });

  it('should fail if Task cannot be noted', async () => {
    // Given
    const spy = jest.spyOn(Task, 'note').mockReturnValue(Result.fail<Task>('error'));
    const dto: NoteTaskDto = { text: faker.lorem.words(5) };
    const member = new MemberEntityBuilder().build();
    await memberRepository.save(member);

    // When
    const result = await useCase.execute({
      dto,
      member,
    });

    // Then
    expect.assertions(1);
    expect(result.isLeft()).toBe(true);

    spy.mockRestore();
  });

  it('should fail on any other error', async () => {
    // Given
    const spy = jest.spyOn(taskRepository, 'save').mockImplementationOnce(() => {
      throw new Error();
    });
    const dto: NoteTaskDto = { text: faker.lorem.words(5) };
    const member = new MemberEntityBuilder().build();
    await memberRepository.save(member);

    // When
    const result = await useCase.execute({
      dto,
      member,
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
      member,
    });
    const task: Task = result.value.getValue();

    // Then
    expect.assertions(2);
    expect(result.isRight()).toBe(true);
    expect(task).toBeDefined();
  });
});
