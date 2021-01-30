import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import urlcat from 'urlcat';
import { Api } from './api.enum';
import { auth } from './auth';

export function archiveTask(
  app: INestApplication,
  loginResponse: request.Response,
  taskId: string,
): request.Test {
  return request(app.getHttpServer())
    .post(urlcat(Api.TASKS_ARCHIVE, { id: taskId }))
    .auth(...auth(loginResponse));
}
