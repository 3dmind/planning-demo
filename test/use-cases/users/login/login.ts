import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersApi } from '../users-api.enum';

export function login(
  app: INestApplication,
  username = 'e2e-planning-demo',
  password = 'e2e-planning-demo',
): request.Test {
  return request(app.getHttpServer())
    .post(UsersApi.USERS_LOGIN)
    .send({
      username,
      password,
    });
}

export function loginAsAlice(app: INestApplication): request.Test {
  return request(app.getHttpServer())
    .post(UsersApi.USERS_LOGIN)
    .send({
      username: 'alice',
      password: 'alice1234',
    });
}

export function loginAsBob(app: INestApplication): request.Test {
  return request(app.getHttpServer())
    .post(UsersApi.USERS_LOGIN)
    .send({
      username: 'bob',
      password: 'bob1234',
    });
}
