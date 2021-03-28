import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../../src/app/app.module';
import { login } from '../login/login';
import { logout } from './logout';

describe('/users/logout (POST)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await moduleFixture.createNestApplication().init();
  });

  afterAll(async () => {
    await app.close();
  });

  it(`should respond with ${HttpStatus.NO_CONTENT} if the logout was successful`, async () => {
    const loginResponse = await login(app).expect(HttpStatus.OK);

    return logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);
  });
});
