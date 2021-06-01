import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { auth } from '../../../auth';
import { TasksApi } from '../tasks-api.enum';

export function getActiveTasks(app: INestApplication, loginResponse: request.Response): request.Test {
  return request(app.getHttpServer())
    .get(TasksApi.TASKS_ACTIVE)
    .auth(...auth(loginResponse));
}
