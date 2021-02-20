import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { TaskDto } from '../../../../src/modules/planning/dtos/task.dto';
import { PlanningModule } from '../../../../src/modules/planning/planning.module';
import { login, loginAsAlice, loginAsBob } from '../../users/login/login';
import { logout } from '../../users/logout/logout';
import { noteTask } from '../note-task/note-task';
import { tickOffTask } from './tick-off-task';

describe('/tasks/:id/tickoff (POST)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [PlanningModule],
    }).compile();

    app = await moduleFixture.createNestApplication().init();
  });

  afterAll(async () => {
    await app.close();
  });

  it(`should respond with ${HttpStatus.NOT_FOUND} if the member cannot be found`, async () => {
    const taskId = '29077746-6161-4261-a38c-6a8e7c0e5bcc';
    const loginResponse = await login(
      app,
      'no-member-planning-demo',
      'no-member-planning-demo',
    ).expect(HttpStatus.OK);

    await tickOffTask(app, loginResponse, taskId).expect(HttpStatus.NOT_FOUND);

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it(`should respond with ${HttpStatus.NOT_FOUND} if the task cannot be found`, async () => {
    const taskId = '29077746-6161-4261-a38c-6a8e7c0e5bcc';
    const loginResponse = await login(app).expect(HttpStatus.OK);

    await tickOffTask(app, loginResponse, taskId).expect(HttpStatus.NOT_FOUND);

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it('should ', async () => {
    let loginResponse: request.Response;
    loginResponse = await loginAsAlice(app).expect(HttpStatus.OK);
    const noteTaskResponse = await noteTask(app, loginResponse).expect(
      HttpStatus.CREATED,
    );
    loginResponse = await loginAsBob(app).expect(HttpStatus.OK);

    await tickOffTask(app, loginResponse, noteTaskResponse.body.id).expect(
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it(`should respond with ${HttpStatus.OK} if the task was ticked-off`, async () => {
    expect.assertions(1);
    const loginResponse = await login(app).expect(HttpStatus.OK);
    const noteTaskResponse = await noteTask(app, loginResponse).expect(
      HttpStatus.CREATED,
    );

    const response = await tickOffTask(
      app,
      loginResponse,
      noteTaskResponse.body.id,
    ).expect(HttpStatus.OK);

    expect(response.body).toMatchObject<Partial<TaskDto>>({
      tickedOffAt: expect.any(String),
      isTickedOff: true,
    });

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });
});
