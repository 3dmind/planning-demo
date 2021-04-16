import { INestApplication } from '@nestjs/common';
import * as faker from 'faker';
import * as request from 'supertest';
import { TaskDto } from '../../../../src/modules/planning/dtos/task.dto';
import { auth } from '../../../auth';
import { TasksApi } from '../tasks-api.enum';

export function noteTask(
  app: INestApplication,
  loginResponse: request.Response,
  text: string = faker.lorem.words(5),
): request.Test {
  return request(app.getHttpServer())
    .post(TasksApi.TASKS)
    .auth(...auth(loginResponse))
    .send({
      text,
    });
}

export interface NoteTaskResponse extends request.Response {
  body: TaskDto;
}
