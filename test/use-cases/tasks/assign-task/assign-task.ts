import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import urlcat from 'urlcat';
import { Api } from '../../../api.enum';
import { auth } from '../../../auth';

export function assignTask(
  app: INestApplication,
  loginResponse: request.Response,
  taskId: string,
  memberId: string,
): request.Test {
  return request(app.getHttpServer())
    .post(urlcat(Api.TASKS_ASSIGN, { id: taskId }))
    .auth(...auth(loginResponse))
    .send({
      memberId,
    });
}
