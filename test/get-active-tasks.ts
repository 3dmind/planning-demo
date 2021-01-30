import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Api } from './api.enum';
import { auth } from './auth';

export function getActiveTasks(
  app: INestApplication,
  loginResponse: request.Response,
): request.Test {
  return request(app.getHttpServer())
    .get(Api.TASKS_ACTIVE)
    .auth(...auth(loginResponse));
}
