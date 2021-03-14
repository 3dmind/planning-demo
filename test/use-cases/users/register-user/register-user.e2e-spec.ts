import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as faker from 'faker';
import * as request from 'supertest';
import { AppModule } from '../../../../src/app/app.module';
import { UserPassword } from '../../../../src/modules/users/domain/user-password.valueobject';
import { UsersApi } from '../users-api.enum';

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

  it('email already exists', async () => {
    const response = await request(app.getHttpServer())
      .post(UsersApi.USERS)
      .send({
        username: 'e2e-planning-demo',
        email: 'e2e@planning.demo',
        password: 'e2e-planning-demo',
      })
      .expect(HttpStatus.CONFLICT);

    expect(response.body.message).toEqual(
      'The email e2e@planning.demo associated for this account already exists.',
    );
  });

  it('username taken', async () => {
    const response = await request(app.getHttpServer())
      .post(UsersApi.USERS)
      .send({
        username: 'e2e-planning-demo',
        email: faker.internet.email(),
        password: 'e2e-planning-demo',
      })
      .expect(HttpStatus.CONFLICT);

    expect(response.body.message).toEqual(
      'The username e2e-planning-demo was already taken.',
    );
  });

  it('password to short', async () => {
    const response = await request(app.getHttpServer())
      .post(UsersApi.USERS)
      .send({
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(UserPassword.minLength - 1),
      })
      .expect(HttpStatus.UNPROCESSABLE_ENTITY);

    expect(response.body.message).toEqual('Text is not at least 6 chars.');
  });

  it('register new user', async () => {
    const username = faker.internet.userName();
    const email = faker.internet.email();
    const password = faker.internet.password(UserPassword.minLength);

    await request(app.getHttpServer())
      .post(UsersApi.USERS)
      .send({
        username,
        email,
        password,
      })
      .expect(HttpStatus.CREATED);

    return request(app.getHttpServer())
      .post(UsersApi.USERS_LOGIN)
      .send({
        username,
        password,
      })
      .expect(HttpStatus.OK);
  });
});
