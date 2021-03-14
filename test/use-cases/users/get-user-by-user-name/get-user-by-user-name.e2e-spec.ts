import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../../../src/app/app.module';
import { auth } from '../../../auth';
import { login } from '../login/login';
import { logout } from '../logout/logout';
import { UsersApi } from '../users-api.enum';

describe('/users/me (GET)', () => {
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

  it('/users/me (GET)', async () => {
    const loginResponse = await login(app).expect(HttpStatus.OK);

    const response = await request(app.getHttpServer())
      .get(UsersApi.USERS_ME)
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
});
