import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { RegisterUserDto } from '../../../../src/modules/users/use-cases/register-user/register-user.dto';
import { UsersApi } from '../users-api.enum';

export function registerUser(
  app: INestApplication,
  dto: RegisterUserDto,
): request.Test {
  return request(app.getHttpServer())
    .post(UsersApi.USERS)
    .send(dto);
}
