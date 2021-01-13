import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { mock, mockReset } from 'jest-mock-extended';
import { UserEntityBuilder } from '../../../../../test/builder/user-entity.builder';
import { DomainEventPublisherService } from '../../../../domain-event-publisher/domain-event-publisher.service';
import { AppErrors, Result } from '../../../../shared/core';
import { UserPassword } from '../../domain/user-password.valueobject';
import { User } from '../../domain/user.entity';
import { InMemoryUserRepository } from '../../repositories/user/in-memory-user.repository';
import { UserRepository } from '../../repositories/user/user.repository';
import { RegisterUserDto } from './register-user.dto';
import { RegisterUserErrors } from './register-user.errors';
import { RegisterUserUsecase } from './register-user.usecase';

describe('RegisterUserUsecase', () => {
  const mockedDomainEventPublisherService = mock<DomainEventPublisherService>();
  let userRepository: UserRepository;
  let useCase: RegisterUserUsecase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserRepository,
          useClass: InMemoryUserRepository,
        },
        {
          provide: DomainEventPublisherService,
          useValue: mockedDomainEventPublisherService,
        },
        RegisterUserUsecase,
      ],
    }).compile();
    module.useLogger(false);

    userRepository = await module.resolve<UserRepository>(UserRepository);
    useCase = await module.resolve<RegisterUserUsecase>(RegisterUserUsecase);
  });

  afterAll(() => {
    mockReset(mockedDomainEventPublisherService);
  });

  it('should fail if username cannot be created', async () => {
    expect.assertions(1);
    const emailFixture = faker.internet.email();
    const passwordFixture = faker.internet.password(UserPassword.minLength);
    const request = {
      email: emailFixture,
      password: passwordFixture,
    } as RegisterUserDto;

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
  });

  it('should fail if user password cannot be created', async () => {
    expect.assertions(1);
    const userNameFixture = faker.internet.userName();
    const emailFixture = faker.internet.email();
    const request = {
      email: emailFixture,
      username: userNameFixture,
    } as RegisterUserDto;

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
  });

  it('should fail if user email cannot be created', async () => {
    expect.assertions(1);
    const passwordFixture = faker.internet.password(UserPassword.minLength);
    const userNameFixture = faker.internet.userName();
    const request = {
      username: userNameFixture,
      password: passwordFixture,
    } as RegisterUserDto;

    const result = await useCase.execute(request);

    expect(result.isLeft()).toBe(true);
  });

  it('should fail if user already exists', async () => {
    expect.assertions(3);
    const user = new UserEntityBuilder().build();
    const emailFixture = user.email.value;
    const passwordFixture = user.password.value;
    const userNameFixture = user.username.value;
    await userRepository.save(user);

    const result = await useCase.execute({
      email: emailFixture,
      password: passwordFixture,
      username: userNameFixture,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(
      RegisterUserErrors.EmailAlreadyExistsError,
    );
    expect(result.value.errorValue().message).toEqual(
      `The email ${emailFixture} associated for this account already exists.`,
    );
  });

  it('should fail if username already taken', async () => {
    expect.assertions(3);
    const user = new UserEntityBuilder().build();
    const emailFixture = user.email.value;
    const passwordFixture = user.password.value;
    const userNameFixture = user.username.value;
    const spy = jest.spyOn(userRepository, 'exists').mockResolvedValue(false);
    await userRepository.save(user);

    const result = await useCase.execute({
      email: emailFixture,
      password: passwordFixture,
      username: userNameFixture,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(RegisterUserErrors.UsernameTakenError);
    expect(result.value.errorValue().message).toEqual(
      `The username ${userNameFixture} was already taken.`,
    );

    spy.mockRestore();
  });

  it('should fail if user cannot be created', async () => {
    expect.assertions(1);
    const emailFixture = faker.internet.email().toLowerCase();
    const passwordFixture = faker.internet.password(UserPassword.minLength);
    const userNameFixture = faker.internet.userName();
    const spy = jest
      .spyOn(User, 'create')
      .mockReturnValue(Result.fail<User>('error'));

    const result = await useCase.execute({
      email: emailFixture,
      password: passwordFixture,
      username: userNameFixture,
    });

    expect(result.isLeft()).toBe(true);

    spy.mockRestore();
  });

  it('should fail on any other error', async () => {
    expect.assertions(2);
    const emailFixture = faker.internet.email().toLowerCase();
    const passwordFixture = faker.internet.password(UserPassword.minLength);
    const userNameFixture = faker.internet.userName();
    const spy = jest
      .spyOn(userRepository, 'save')
      .mockImplementationOnce(() => {
        throw new Error();
      });

    const result = await useCase.execute({
      email: emailFixture,
      password: passwordFixture,
      username: userNameFixture,
    });

    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should succeed', async () => {
    expect.assertions(1);
    const emailFixture = faker.internet.email().toLowerCase();
    const passwordFixture = faker.internet.password(UserPassword.minLength);
    const userNameFixture = faker.internet.userName();

    const result = await useCase.execute({
      email: emailFixture,
      password: passwordFixture,
      username: userNameFixture,
    });

    expect(result.isRight()).toBe(true);
  });
});
