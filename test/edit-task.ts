import { INestApplication } from '@nestjs/common';
import * as faker from 'faker';
import * as request from 'supertest';
import urlcat from 'urlcat';
import { Api } from './api.enum';
import { auth } from './auth';

export function editTask(
  app: INestApplication,
  loginResponse: request.Response,
  taskId: string,
  text: string = faker.lorem.words(5),
): request.Test {
  return request(app.getHttpServer())
    .post(urlcat(Api.TASKS_EDIT, { id: taskId }))
    .auth(...auth(loginResponse))
    .send({
      text,
    });
}
