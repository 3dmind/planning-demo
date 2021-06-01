import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { auth } from '../../../auth';
import { UsersApi } from '../users-api.enum';

export function getUserByUserName(app: INestApplication, loginResponse: request.Response): request.Test {
  return request(app.getHttpServer())
    .get(UsersApi.USERS_ME)
    .auth(...auth(loginResponse));
}
