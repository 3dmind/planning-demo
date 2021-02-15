import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import urlcat from 'urlcat';
import { auth } from '../../../auth';
import { TasksApi } from '../tasks-api.enum';

export function archiveTask(
  app: INestApplication,
  loginResponse: request.Response,
  taskId: string,
): request.Test {
  return request(app.getHttpServer())
    .post(urlcat(TasksApi.TASKS_ARCHIVE, { id: taskId }))
    .auth(...auth(loginResponse));
}
