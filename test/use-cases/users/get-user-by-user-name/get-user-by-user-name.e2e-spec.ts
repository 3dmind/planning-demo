import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../../src/app/app.module';
import { login } from '../login/login';
import { logout } from '../logout/logout';
import { getUserByUserName } from './get-user-by-user-name';

describe('/users/me (GET)', () => {
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

  it(`should respond with ${HttpStatus.OK} if the user was found`, async () => {
    expect.assertions(1);

    const loginResponse = await login(app).expect(HttpStatus.OK);

    const response = await getUserByUserName(app, loginResponse).expect(
      HttpStatus.OK,
    );
    expect(response.body).toMatchObject({
      createdAt: expect.any(String),
      email: 'e2e@planning.demo',
      isEmailVerified: false,
      username: 'e2e-planning-demo',
    });

    await logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);
  });
});
