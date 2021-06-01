import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../../../src/app/app.module';
import { TaskDto } from '../../../../src/modules/planning/dtos/task.dto';
import { login, loginAsAlice, loginAsBob } from '../../users/login/login';
import { logout } from '../../users/logout/logout';
import { noteTask } from '../note-task/note-task';
import { tickOffTask } from '../tick-off-task/tick-off-task';
import { resumeTask } from './resume-task';

describe('/tasks/:id/resume (PUT)', () => {
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

  it(`should respond with ${HttpStatus.NOT_FOUND} if the member cannot be found`, async () => {
    const taskId = '68b71a95-e59b-446f-ac81-938648dc3781';
    const loginResponse = await login(app, 'no-member-planning-demo', 'no-member-planning-demo').expect(HttpStatus.OK);

    await resumeTask(app, loginResponse, taskId).expect(HttpStatus.NOT_FOUND);

    return logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);
  });

  it(`should respond with ${HttpStatus.NOT_FOUND} if the task cannot be found`, async () => {
    const taskId = '68b71a95-e59b-446f-ac81-938648dc3781';
    const loginResponse = await login(app).expect(HttpStatus.OK);

    await resumeTask(app, loginResponse, taskId).expect(HttpStatus.NOT_FOUND);

    return logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);
  });

  it(`should respond with ${HttpStatus.UNPROCESSABLE_ENTITY} if the member is not the assignee`, async () => {
    let loginResponse: request.Response;
    loginResponse = await loginAsAlice(app).expect(HttpStatus.OK);
    const noteTaskResponse = await noteTask(app, loginResponse).expect(HttpStatus.CREATED);
    const taskId = noteTaskResponse.body.id;
    await tickOffTask(app, loginResponse, taskId).expect(HttpStatus.OK);

    loginResponse = await loginAsBob(app).expect(HttpStatus.OK);
    await resumeTask(app, loginResponse, taskId).expect(HttpStatus.UNPROCESSABLE_ENTITY);

    return logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);
  });

  it(`should respond with ${HttpStatus.OK} if the task was successfully resumed`, async () => {
    const loginResponse = await login(app).expect(HttpStatus.OK);
    const noteTaskResponse = await noteTask(app, loginResponse).expect(HttpStatus.CREATED);

    const tickOffTaskResponse = await tickOffTask(app, loginResponse, noteTaskResponse.body.id).expect(HttpStatus.OK);

    const resumeTaskResponse = await resumeTask(app, loginResponse, noteTaskResponse.body.id).expect(HttpStatus.OK);

    expect.assertions(2);
    expect(tickOffTaskResponse.body).toMatchObject<Partial<TaskDto>>({
      tickedOffAt: expect.any(String),
      isTickedOff: true,
    });
    expect(resumeTaskResponse.body).toMatchObject<Partial<TaskDto>>({
      resumedAt: expect.any(String),
      isTickedOff: false,
    });

    return logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);
  });
});
