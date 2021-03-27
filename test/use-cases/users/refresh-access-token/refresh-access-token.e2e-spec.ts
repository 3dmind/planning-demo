import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../../../src/app/app.module';
import { login } from '../login/login';
import { logout } from '../logout/logout';
import { UsersApi } from '../users-api.enum';

xdescribe('/users/refresh (POST)', () => {
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

  it('/users/refresh (POST)', async () => {
    const loginResponse = await login(app).expect(HttpStatus.OK);

    const response = await request(app.getHttpServer())
      .post(UsersApi.USERS_REFRESH)
      .send({
        refreshToken: loginResponse.body.refreshToken,
      })
      .expect(HttpStatus.OK);

    expect(response.body).toMatchObject({
      accessToken: expect.any(String),
      refreshToken: expect.any(String),
    });
    expect(response.body.accessToken).not.toStrictEqual(
      loginResponse.body.accessToken,
    );
    expect(response.body.refreshToken).toStrictEqual(
      loginResponse.body.refreshToken,
    );

    await logout(app, loginResponse).expect(HttpStatus.OK);
  });
});
