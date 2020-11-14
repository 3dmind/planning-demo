import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mock } from 'jest-mock-extended';
import { CreateUserUseCase } from './use-cases/create-user/create-user.use-case';
import { UsersController } from './users.controller';

describe('Users Controller', () => {
  const mockedLogger = mock<Logger>();
  const mockedCreateUserUseCase = mock<CreateUserUseCase>();
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: Logger, useValue: mockedLogger },
        { provide: CreateUserUseCase, useValue: mockedCreateUserUseCase },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
