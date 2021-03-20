import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../../../src/app/app.module';
import { TaskDto } from '../../../../src/modules/planning/dtos/task.dto';
import { login, loginAsAlice, loginAsBob } from '../../users/login/login';
import { logout } from '../../users/logout/logout';
import { noteTask } from '../note-task/note-task';
import { archiveTask } from './archive-task';

describe('/tasks/:id/archive (POST)', () => {
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
    const taskId = 'f6284ef5-963c-4d5c-88a6-f7a48dc6281b';
    const loginResponse = await login(
      app,
      'no-member-planning-demo',
      'no-member-planning-demo',
    ).expect(HttpStatus.OK);

    await archiveTask(app, loginResponse, taskId).expect(HttpStatus.NOT_FOUND);

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it(`should respond with ${HttpStatus.NOT_FOUND} if the task cannot be found`, async () => {
    const taskId = 'f6284ef5-963c-4d5c-88a6-f7a48dc6281b';
    const loginResponse = await login(app).expect(HttpStatus.OK);

    await archiveTask(app, loginResponse, taskId).expect(HttpStatus.NOT_FOUND);

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it(`should respond with ${HttpStatus.UNPROCESSABLE_ENTITY} if the member is not the task owner`, async () => {
    let loginResponse: request.Response;
    loginResponse = await loginAsAlice(app).expect(HttpStatus.OK);
    const noteTaskResponse = await noteTask(app, loginResponse).expect(
      HttpStatus.CREATED,
    );
    loginResponse = await loginAsBob(app).expect(HttpStatus.OK);

    await archiveTask(app, loginResponse, noteTaskResponse.body.id).expect(
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it(`should respond with ${HttpStatus.OK} if the task was successfully archived`, async () => {
    const loginResponse = await login(app).expect(HttpStatus.OK);
    const noteTaskResponse = await noteTask(app, loginResponse).expect(
      HttpStatus.CREATED,
    );

    const response = await archiveTask(
      app,
      loginResponse,
      noteTaskResponse.body.id,
    );

    expect.assertions(1);
    expect(response.body).toMatchObject<Partial<TaskDto>>({
      archivedAt: expect.any(String),
      isArchived: true,
    });

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });
});
