import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { UsersModule } from '../../../../src/modules/users/users.module';
import { login } from '../login/login';
import { logout } from '../logout/logout';
import { UsersApi } from '../users-api.enum';

xdescribe('/users/refresh (POST)', () => {
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

  it('/users/refresh (POST)', async () => {
    const loginResponse = await login(app).expect(HttpStatus.OK);

    const response = await request(app.getHttpServer())
      .post(UsersApi.USERS_REFRESH)
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
