import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import { UserEntityBuilder } from '../../../../../test/builder/user-entity.builder';
import { AppErrors } from '../../../../shared/core';
import { UserPassword } from '../../domain/user-password.valueobject';
import { InMemoryUserRepository } from '../../repositories/user/in-memory-user.repository';
import { UserRepository } from '../../repositories/user/user.repository';
import { ValidateUserDto } from './validate-user.dto';
import { ValidateUserErrors } from './validate-user.errors';
import { ValidateUserUsecase } from './validate-user.usecase';

describe('ValidateUserUsecase', () => {
  let userRepository: UserRepository;
  let useCase: ValidateUserUsecase;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: UserRepository,
          useClass: InMemoryUserRepository,
        },
        ValidateUserUsecase,
      ],
    }).compile();
    module.useLogger(false);

    userRepository = module.get<UserRepository>(UserRepository);
    useCase = module.get<ValidateUserUsecase>(ValidateUserUsecase);
  });

  it('should fail if username cannot be created', async () => {
    // Given
    const usernameFixture = '';
    const passwordFixture = faker.internet.password(UserPassword.minLength);
    const request: ValidateUserDto = {
      username: usernameFixture,
      password: passwordFixture,
    };

    // When
    const result = await useCase.execute(request);

    // Then
    expect.assertions(1);
    expect(result.isLeft()).toBe(true);
  });

  it('should fail if user password cannot be created', async () => {
    // Given
    const usernameFixture = faker.internet.userName();
    const passwordFixture = '';
    const request: ValidateUserDto = {
      username: usernameFixture,
      password: passwordFixture,
    };

    // When
    const result = await useCase.execute(request);

    // Then
    expect.assertions(1);
    expect(result.isLeft()).toBe(true);
  });

  it("should fail if user doesn't exist", async () => {
    // Given
    const usernameFixture = faker.internet.userName();
    const passwordFixture = faker.internet.password(UserPassword.minLength);
    const request: ValidateUserDto = {
      username: usernameFixture,
      password: passwordFixture,
    };

    // When
    const result = await useCase.execute(request);

    // Then
    expect.assertions(3);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(
      ValidateUserErrors.UserNameDoesntExistError,
    );
    expect(result.value.errorValue().message).toEqual(
      'Username or password incorrect.',
    );
  });

  it("should fail if password doesn't match", async () => {
    // Given
    const usernameFixture = faker.internet.userName();
    const passwordFixture = faker.internet.password(UserPassword.minLength);
    const hashedPassword = await UserPassword.create({
      value: passwordFixture,
      hashed: false,
    })
      .getValue()
      .getHashedValue();
    const missMatchingPasswordFixture = faker.internet.password(
      UserPassword.minLength,
    );
    const user = new UserEntityBuilder({
      username: usernameFixture,
      password: hashedPassword,
      passwordIsHashed: true,
    }).build();
    const request: ValidateUserDto = {
      username: usernameFixture,
      password: missMatchingPasswordFixture,
    };
    await userRepository.save(user);

    // When
    const result = await useCase.execute(request);

    // Then
    expect.assertions(3);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(
      ValidateUserErrors.PasswordDoesntMatchError,
    );
    expect(result.value.errorValue().message).toEqual('Password doesnt match.');
  });

  it('should fail on any other error', async () => {
    // Given
    const spy = jest
      .spyOn(userRepository, 'getUserByUsername')
      .mockImplementationOnce(() => {
        throw new Error();
      });
    const usernameFixture = faker.internet.userName();
    const passwordFixture = faker.internet.password(UserPassword.minLength);
    const request: ValidateUserDto = {
      username: usernameFixture,
      password: passwordFixture,
    };

    // When
    const result = await useCase.execute(request);

    // Then
    expect.assertions(2);
    expect(result.isLeft()).toBe(true);
    expect(result.value).toBeInstanceOf(AppErrors.UnexpectedError);

    spy.mockRestore();
  });

  it('should succeed', async () => {
    // Given
    const usernameFixture = faker.internet.userName();
    const passwordFixture = faker.internet.password(UserPassword.minLength);
    const hashedPassword = await UserPassword.create({
      value: passwordFixture,
      hashed: false,
    })
      .getValue()
      .getHashedValue();
    const user = new UserEntityBuilder({
      username: usernameFixture,
      password: hashedPassword,
      passwordIsHashed: true,
    }).build();
    const request: ValidateUserDto = {
      username: usernameFixture,
      password: passwordFixture,
    };
    await userRepository.save(user);

    // When
    const result = await useCase.execute(request);

    // Then
    expect.assertions(2);
    expect(result.isRight()).toBe(true);
    expect(result.value.getValue()).toBe(user);
  });
});
