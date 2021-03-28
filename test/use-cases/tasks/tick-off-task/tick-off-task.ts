import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import urlcat from 'urlcat';
import { auth } from '../../../auth';
import { TasksApi } from '../tasks-api.enum';

export function tickOffTask(
  app: INestApplication,
  loginResponse: request.Response,
  taskId: string,
): request.Test {
  return request(app.getHttpServer())
    .put(urlcat(TasksApi.TASKS_TICK_OFF, { id: taskId }))
    .auth(...auth(loginResponse));
}
