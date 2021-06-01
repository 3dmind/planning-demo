import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../../../src/app/app.module';
import { TaskDto } from '../../../../src/modules/planning/dtos/task.dto';
import { login, loginAsAlice, loginAsBob } from '../../users/login/login';
import { logout } from '../../users/logout/logout';
import { archiveTask } from '../archive-task/archive-task';
import { assignTask } from '../assign-task/assign-task';
import { discardTask } from '../discard-task/discard-task';
import { noteTask } from '../note-task/note-task';
import { getActiveTasks } from './get-active-tasks';

describe('/tasks/active (GET)', () => {
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
    const loginResponse = await login(app, 'no-member-planning-demo', 'no-member-planning-demo').expect(HttpStatus.OK);

    await getActiveTasks(app, loginResponse).expect(HttpStatus.NOT_FOUND);

    return logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);
  });

  it('should respond with the active tasks of a member', async () => {
    let loginResponse: request.Response;
    let noteTaskResponse: request.Response;

    /*
      Alice assigns a task to Bob.
     */
    loginResponse = await loginAsAlice(app).expect(HttpStatus.OK);
    noteTaskResponse = await noteTask(app, loginResponse).expect(HttpStatus.CREATED);
    const assignedTaskResponse = await assignTask(
      app,
      loginResponse,
      noteTaskResponse.body.id,
      '878e77d6-39ba-4367-ae0f-1e5c32d59b84',
    ).expect(HttpStatus.OK);
    await logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);

    /*
      Bob logs in
     */
    loginResponse = await loginAsBob(app).expect(HttpStatus.OK);

    /*
      Bob archives a task.
     */
    noteTaskResponse = await noteTask(app, loginResponse).expect(HttpStatus.CREATED);
    await archiveTask(app, loginResponse, noteTaskResponse.body.id).expect(HttpStatus.OK);

    /*
      Bob discards a task
     */
    noteTaskResponse = await noteTask(app, loginResponse).expect(HttpStatus.CREATED);
    await discardTask(app, loginResponse, noteTaskResponse.body.id).expect(HttpStatus.OK);

    /*
      Bob notes a new task.
     */
    await noteTask(app, loginResponse).expect(HttpStatus.CREATED);

    /*
      Get all active tasks of Bob.
     */
    const response = await getActiveTasks(app, loginResponse).expect(HttpStatus.OK);

    expect.assertions(3);
    expect(response.body).toContainEqual(assignedTaskResponse.body);
    expect(response.body).toContainEqual(
      expect.objectContaining<Partial<TaskDto>>({
        isArchived: false,
        isDiscarded: false,
      }),
    );
    expect(response.body).not.toContainEqual(
      expect.objectContaining<Partial<TaskDto>>({
        isArchived: true,
        isDiscarded: true,
      }),
    );

    /*
      Bob logs out
     */
    return logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);
  });
});
