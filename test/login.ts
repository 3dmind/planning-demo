import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Api } from './api.enum';

export function login(
  app: INestApplication,
  username = 'e2e-planning-demo',
  password = 'e2e-planning-demo',
): request.Test {
  return request(app.getHttpServer())
    .post(Api.USERS_LOGIN)
    .send({
      username,
      password,
    });
}
