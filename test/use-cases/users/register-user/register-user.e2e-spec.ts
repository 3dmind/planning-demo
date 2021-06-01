import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as faker from 'faker';
import { AppModule } from '../../../../src/app/app.module';
import { UserPassword } from '../../../../src/modules/users/domain/user-password.valueobject';
import { RegisterUserDto } from '../../../../src/modules/users/use-cases/register-user/register-user.dto';
import { registerUser } from './register-user';

describe('/users (POST)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await moduleFixture.createNestApplication().init();
  });

  afterAll(async () => {
    await app.close();
  });

  it(`should respond with ${HttpStatus.CONFLICT} if the email address already exists`, async () => {
    const dto: RegisterUserDto = {
      username: 'e2e-planning-demo',
      email: 'e2e@planning.demo',
      password: 'e2e-planning-demo',
    };

    const response = await registerUser(app, dto).expect(HttpStatus.CONFLICT);

    expect.assertions(1);
    expect(response.body.message).toEqual('The email e2e@planning.demo associated for this account already exists.');
  });

  it(`should respond with ${HttpStatus.CONFLICT} if the username is taken`, async () => {
    const dto: RegisterUserDto = {
      username: 'e2e-planning-demo',
      email: faker.internet.email(),
      password: 'e2e-planning-demo',
    };

    const response = await registerUser(app, dto).expect(HttpStatus.CONFLICT);

    expect.assertions(1);
    expect(response.body.message).toEqual('The username e2e-planning-demo was already taken.');
  });

  it(`should respond with ${HttpStatus.UNPROCESSABLE_ENTITY} if the password is to short`, async () => {
    const dto: RegisterUserDto = {
      username: faker.internet.userName(),
      email: faker.internet.email(),
      password: faker.internet.password(UserPassword.MIN_LENGTH - 1),
    };

    const response = await registerUser(app, dto).expect(HttpStatus.UNPROCESSABLE_ENTITY);

    expect.assertions(1);
    expect(response.body.message).toEqual('Text is not at least 6 chars.');
  });

  it(`should respond with ${HttpStatus.CREATED} if the new user was successfully registered`, async () => {
    const username = faker.internet.userName();
    const email = faker.internet.email();
    const password = faker.internet.password(UserPassword.MIN_LENGTH);

    const dto = {
      username,
      email,
      password,
    };

    return registerUser(app, dto).expect(HttpStatus.CREATED);
  });
});
