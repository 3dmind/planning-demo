import { INestApplication } from '@nestjs/common';
import * as faker from 'faker';
import * as request from 'supertest';
import { Api } from './api.enum';
import { auth } from './auth';

export function noteTask(
  app: INestApplication,
  loginResponse: request.Response,
  text: string = faker.lorem.words(5),
): request.Test {
  return request(app.getHttpServer())
    .post(Api.TASKS)
    .auth(...auth(loginResponse))
    .send({
      text,
    });
}
