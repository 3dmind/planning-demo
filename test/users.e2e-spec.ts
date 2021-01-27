import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as faker from 'faker';
import * as request from 'supertest';
import { UserPassword } from '../src/modules/users/domain/user-password.valueobject';
import { UsersModule } from '../src/modules/users/users.module';
import { Api } from './api.enum';
import { auth } from './auth';
import { login } from './login';
import { logout } from './logout';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();

    app = await moduleFixture.createNestApplication().init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/users (POST)', () => {
    it('email already exists', async () => {
      const response = await request(app.getHttpServer())
        .post(Api.USERS)
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
        .post(Api.USERS)
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
        .post(Api.USERS)
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
        .post(Api.USERS)
        .send({
          username,
          email,
          password,
        })
        .expect(HttpStatus.CREATED);

      return request(app.getHttpServer())
        .post(Api.USERS_LOGIN)
        .send({
          username,
          password,
        })
        .expect(HttpStatus.OK);
    });
  });

  describe('/users/login (POST)', () => {
    it('no credentials', async () => {
      return request(app.getHttpServer())
        .post(Api.USERS_LOGIN)
        .send({})
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('wrong username', async () => {
      const response = await request(app.getHttpServer())
        .post(Api.USERS_LOGIN)
        .send({
          username: 'wrong-username',
          password: 'e2e-planning-demo',
        })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body.message).toEqual('Username or password incorrect.');
    });

    it('wrong password', async () => {
      const response = await request(app.getHttpServer())
        .post(Api.USERS_LOGIN)
        .send({
          username: 'e2e-planning-demo',
          password: 'wrong-password',
        })
        .expect(HttpStatus.UNAUTHORIZED);

      expect(response.body.message).toEqual('Password doesnt match.');
    });

    it('correct credentials', async () => {
      const response = await request(app.getHttpServer())
        .post(Api.USERS_LOGIN)
        .send({
          username: 'e2e-planning-demo',
          password: 'e2e-planning-demo',
        })
        .expect(HttpStatus.OK);

      expect(response.body).toMatchObject({
        access_token: expect.any(String),
        refresh_token: expect.any(String),
      });
    });
  });

  it('/users/logout (POST)', async () => {
    const loginResponse = await login(app).expect(HttpStatus.OK);

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it('/users/me (GET)', async () => {
    const loginResponse = await login(app).expect(HttpStatus.OK);

    const response = await request(app.getHttpServer())
      .get(Api.USERS_ME)
      .auth(...auth(loginResponse))
      .expect(HttpStatus.OK);

    expect(response.body).toMatchObject({
      createdAt: expect.any(String),
      email: 'e2e@planning.demo',
      isEmailVerified: false,
      username: 'e2e-planning-demo',
    });

    await logout(app, loginResponse).expect(HttpStatus.OK);
  });

  xit('/users/refresh (POST)', async () => {
    const loginResponse = await login(app).expect(HttpStatus.OK);

    const response = await request(app.getHttpServer())
      .post(Api.USERS_REFRESH)
      .send({
        refresh_token: loginResponse.body.refresh_token,
      })
      .expect(HttpStatus.OK);

    expect(response.body).toMatchObject({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
    });
    expect(response.body.access_token).not.toStrictEqual(
      loginResponse.body.access_token,
    );
    expect(response.body.refresh_token).toStrictEqual(
      loginResponse.body.refresh_token,
    );

    await logout(app, loginResponse).expect(HttpStatus.OK);
  });
});
