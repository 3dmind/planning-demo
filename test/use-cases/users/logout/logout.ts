import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { auth } from '../../../auth';
import { UsersApi } from '../users-api.enum';

export function logout(
  app: INestApplication,
  loginResponse: request.Response,
): request.Test {
  return request(app.getHttpServer())
    .post(UsersApi.USERS_LOGOUT)
    .auth(...auth(loginResponse));
}
