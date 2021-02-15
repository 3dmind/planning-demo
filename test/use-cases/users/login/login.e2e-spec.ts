import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { UsersModule } from '../../../../src/modules/users/users.module';
import { UsersApi } from '../users-api.enum';

describe('/users/login (POST)', () => {
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

  it('no credentials', async () => {
    return request(app.getHttpServer())
      .post(UsersApi.USERS_LOGIN)
      .send({})
      .expect(HttpStatus.UNAUTHORIZED);
  });

  it('wrong username', async () => {
    const response = await request(app.getHttpServer())
      .post(UsersApi.USERS_LOGIN)
      .send({
        username: 'wrong-username',
        password: 'e2e-planning-demo',
      })
      .expect(HttpStatus.UNAUTHORIZED);

    expect(response.body.message).toEqual('Username or password incorrect.');
  });

  it('wrong password', async () => {
    const response = await request(app.getHttpServer())
      .post(UsersApi.USERS_LOGIN)
      .send({
        username: 'e2e-planning-demo',
        password: 'wrong-password',
      })
      .expect(HttpStatus.UNAUTHORIZED);

    expect(response.body.message).toEqual('Password doesnt match.');
  });

  it('correct credentials', async () => {
    const response = await request(app.getHttpServer())
      .post(UsersApi.USERS_LOGIN)
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
