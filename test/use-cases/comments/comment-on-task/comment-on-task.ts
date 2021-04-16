import { INestApplication } from '@nestjs/common';
import * as faker from 'faker';
import * as request from 'supertest';
import urlcat from 'urlcat';
import { auth } from '../../../auth';
import { CommentsApi } from '../comments-api.enum';

export function commentOnTask(
  app: INestApplication,
  loginResponse: request.Response,
  taskId: string,
  text: string = faker.lorem.sentence(25),
): request.Test {
  const url = urlcat(CommentsApi.COMMENTS, { taskId });
  return request(app.getHttpServer())
    .post(url)
    .auth(...auth(loginResponse))
    .send({
      text,
    });
}
