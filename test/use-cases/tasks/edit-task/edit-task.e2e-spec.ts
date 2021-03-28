import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as faker from 'faker';
import * as request from 'supertest';
import { AppModule } from '../../../../src/app/app.module';
import { TaskDto } from '../../../../src/modules/planning/dtos/task.dto';
import { login, loginAsAlice, loginAsBob } from '../../users/login/login';
import { logout } from '../../users/logout/logout';
import { noteTask } from '../note-task/note-task';
import { editTask } from './edit-task';

describe('/tasks/:id/edit (POST)', () => {
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
    const taskId = '00f60ee9-9b19-4a7b-9f51-07f4511adef9';
    const loginResponse = await login(
      app,
      'no-member-planning-demo',
      'no-member-planning-demo',
    ).expect(HttpStatus.OK);

    await editTask(app, loginResponse, taskId).expect(HttpStatus.NOT_FOUND);

    return logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);
  });

  it(`should respond with ${HttpStatus.NOT_FOUND} if the task cannot be found`, async () => {
    const taskId = '00f60ee9-9b19-4a7b-9f51-07f4511adef9';
    const loginResponse = await login(app).expect(HttpStatus.OK);

    await editTask(app, loginResponse, taskId).expect(HttpStatus.NOT_FOUND);

    return logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);
  });

  it(`should respond with ${HttpStatus.UNPROCESSABLE_ENTITY} if the member is not the task owner`, async () => {
    let loginResponse: request.Response;
    loginResponse = await loginAsAlice(app).expect(HttpStatus.OK);
    const noteTaskResponse = await noteTask(app, loginResponse).expect(
      HttpStatus.CREATED,
    );
    loginResponse = await loginAsBob(app).expect(HttpStatus.OK);

    await editTask(app, loginResponse, noteTaskResponse.body.id).expect(
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    return logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);
  });

  it(`should respond with ${HttpStatus.OK} if the task description was edited`, async () => {
    const noteTaskText = faker.lorem.words(5);
    const editTaskText = faker.lorem.words(5);
    const loginResponse = await login(app).expect(HttpStatus.OK);
    const noteTaskResponse = await noteTask(
      app,
      loginResponse,
      noteTaskText,
    ).expect(HttpStatus.CREATED);

    const editTaskResponse = await editTask(
      app,
      loginResponse,
      noteTaskResponse.body.id,
      editTaskText,
    ).expect(HttpStatus.OK);

    expect.assertions(1);
    expect(editTaskResponse.body).toMatchObject<Partial<TaskDto>>({
      editedAt: expect.any(String),
      description: editTaskText,
    });

    return logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);
  });
});
