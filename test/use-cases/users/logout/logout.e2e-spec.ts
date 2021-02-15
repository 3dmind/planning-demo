import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UsersModule } from '../../../../src/modules/users/users.module';
import { login } from '../login/login';
import { logout } from './logout';

describe('/users/logout (POST)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile();

    app = await moduleFixture.createNestApplication().init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/users/logout (POST)', async () => {
    const loginResponse = await login(app).expect(HttpStatus.OK);

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });
});
