import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Api } from './api.enum';
import { auth } from './auth';

export function logout(
  app: INestApplication,
  loginResponse: request.Response,
): request.Test {
  return request(app.getHttpServer())
    .post(Api.USERS_LOGOUT)
    .auth(...auth(loginResponse));
}
