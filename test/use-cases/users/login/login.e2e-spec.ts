import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../../../../src/app/app.module';
import { login } from './login';

describe('/users/login (POST)', () => {
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

  it(`should respond with ${HttpStatus.UNAUTHORIZED} if no credentials are provided`, async () => {
    return login(app, '', '').expect(HttpStatus.UNAUTHORIZED);
  });

  it(`should respond with ${HttpStatus.UNAUTHORIZED} if the username is incorrect`, async () => {
    expect.assertions(1);

    const response = await login(
      app,
      'wrong-username',
      'e2e-planning-demo',
    ).expect(HttpStatus.UNAUTHORIZED);

    expect(response.body.message).toEqual('Username or password incorrect.');
  });

  it(`should respond with ${HttpStatus.UNAUTHORIZED} if the password does not match`, async () => {
    expect.assertions(1);

    const response = await login(
      app,
      'e2e-planning-demo',
      'wrong password',
    ).expect(HttpStatus.UNAUTHORIZED);

    expect(response.body.message).toEqual('Password doesnt match.');
  });

  it(`should respond with ${HttpStatus.OK} if the correct credentials are provided`, async () => {
    expect.assertions(1);

    const response = await login(
      app,
      'e2e-planning-demo',
      'e2e-planning-demo',
    ).expect(HttpStatus.OK);

    expect(response.body).toMatchObject({
      access_token: expect.any(String),
      refresh_token: expect.any(String),
    });
  });
});
