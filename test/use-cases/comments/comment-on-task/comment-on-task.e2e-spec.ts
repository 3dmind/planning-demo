import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as faker from 'faker';
import * as request from 'supertest';
import { AppModule } from '../../../../src/app/app.module';
import { assignTask } from '../../tasks/assign-task/assign-task';
import { noteTask, NoteTaskResponse } from '../../tasks/note-task/note-task';
import { login, loginAsAlice, loginAsBob } from '../../users/login/login';
import { logout } from '../../users/logout/logout';
import { commentOnTask } from './comment-on-task';

describe('/comments?taskId= (POST)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await module.createNestApplication().init();
  });

  afterAll(async () => {
    await app.close();
  });

  it(`should respond with ${HttpStatus.NOT_FOUND} if the member cannot be found`, async () => {
    const taskId = faker.random.uuid();
    const loginResponse = await login(
      app,
      'no-member-planning-demo',
      'no-member-planning-demo',
    ).expect(HttpStatus.OK);

    await commentOnTask(app, loginResponse, taskId).expect(
      HttpStatus.NOT_FOUND,
    );

    return logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);
  });

  it(`should respond with ${HttpStatus.NOT_FOUND} if the task cannot be found`, async () => {
    const taskId = faker.random.uuid();
    const loginResponse = await login(app).expect(HttpStatus.OK);

    await commentOnTask(app, loginResponse, taskId).expect(
      HttpStatus.NOT_FOUND,
    );

    return logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);
  });

  it(`should respond with ${HttpStatus.FORBIDDEN} if the member is not the task owner`, async () => {
    let loginResponse: request.Response;

    loginResponse = await loginAsAlice(app).expect(HttpStatus.OK);
    const noteTaskResponse: NoteTaskResponse = await noteTask(
      app,
      loginResponse,
    ).expect(HttpStatus.CREATED);
    await logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);

    loginResponse = await loginAsBob(app).expect(HttpStatus.OK);
    await commentOnTask(app, loginResponse, noteTaskResponse.body.id).expect(
      HttpStatus.FORBIDDEN,
    );

    return logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);
  });

  it(`should respond with ${HttpStatus.CREATED} when the task owner commented on the task`, async () => {
    const loginResponse = await loginAsAlice(app).expect(HttpStatus.OK);
    const noteTaskResponse: NoteTaskResponse = await noteTask(
      app,
      loginResponse,
    ).expect(HttpStatus.CREATED);

    await commentOnTask(app, loginResponse, noteTaskResponse.body.id).expect(
      HttpStatus.CREATED,
    );

    return logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);
  });

  it(`should respond with ${HttpStatus.CREATED} when the assignee commented on the task`, async () => {
    let loginResponse: request.Response;
    const bobsMemberId = '878e77d6-39ba-4367-ae0f-1e5c32d59b84';

    loginResponse = await loginAsAlice(app).expect(HttpStatus.OK);
    const noteTaskResponse: NoteTaskResponse = await noteTask(
      app,
      loginResponse,
    ).expect(HttpStatus.CREATED);
    await assignTask(
      app,
      loginResponse,
      noteTaskResponse.body.id,
      bobsMemberId,
    ).expect(HttpStatus.OK);
    await logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);

    loginResponse = await loginAsBob(app).expect(HttpStatus.OK);
    await commentOnTask(app, loginResponse, noteTaskResponse.body.id).expect(
      HttpStatus.CREATED,
    );

    return logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);
  });
});
