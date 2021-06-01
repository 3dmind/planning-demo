import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { auth } from '../../../auth';
import { TasksApi } from '../tasks-api.enum';

export function getArchivedTasks(app: INestApplication, loginResponse: request.Response): request.Test {
  return request(app.getHttpServer())
    .get(TasksApi.TASKS_ARCHIVED)
    .auth(...auth(loginResponse));
}
