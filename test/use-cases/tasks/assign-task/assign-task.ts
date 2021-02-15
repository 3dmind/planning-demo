import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import urlcat from 'urlcat';
import { auth } from '../../../auth';
import { TasksApi } from '../tasks-api.enum';

export function assignTask(
  app: INestApplication,
  loginResponse: request.Response,
  taskId: string,
  memberId: string,
): request.Test {
  return request(app.getHttpServer())
    .post(urlcat(TasksApi.TASKS_ASSIGN, { id: taskId }))
    .auth(...auth(loginResponse))
    .send({
      memberId,
    });
}
