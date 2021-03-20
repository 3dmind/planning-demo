import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../../../../src/app/app.module';
import { TaskDto } from '../../../../src/modules/planning/dtos/task.dto';
import { login, loginAsAlice, loginAsBob } from '../../users/login/login';
import { logout } from '../../users/logout/logout';
import { archiveTask } from '../archive-task/archive-task';
import { discardTask } from '../discard-task/discard-task';
import { noteTask } from '../note-task/note-task';
import { getArchivedTasks } from './get-archived-tasks';

describe('/tasks/archived (GET)', () => {
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
    const loginResponse = await login(
      app,
      'no-member-planning-demo',
      'no-member-planning-demo',
    ).expect(HttpStatus.OK);

    await getArchivedTasks(app, loginResponse).expect(HttpStatus.NOT_FOUND);

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it('should respond with the archived task of a member', async () => {
    let loginResponse: request.Response;
    let noteTaskResponse: request.Response;

    /*
      Alice notes a new task.
     */
    loginResponse = await loginAsAlice(app).expect(HttpStatus.OK);
    const notedTaskFromAlice = await noteTask(app, loginResponse).expect(
      HttpStatus.CREATED,
    );

    /*
      Bob logs in
     */
    loginResponse = await loginAsBob(app).expect(HttpStatus.OK);

    /*
      Bob archives a task.
     */
    noteTaskResponse = await noteTask(app, loginResponse).expect(
      HttpStatus.CREATED,
    );
    await archiveTask(app, loginResponse, noteTaskResponse.body.id).expect(
      HttpStatus.OK,
    );

    /*
      Bob discards a task
     */
    noteTaskResponse = await noteTask(app, loginResponse).expect(
      HttpStatus.CREATED,
    );
    await discardTask(app, loginResponse, noteTaskResponse.body.id).expect(
      HttpStatus.OK,
    );

    /*
      Get all archived tasks of Bob
     */
    const response = await getArchivedTasks(app, loginResponse).expect(
      HttpStatus.OK,
    );

    expect.assertions(4);
    expect(response.body).toContainEqual(
      expect.objectContaining<Partial<TaskDto>>({
        isArchived: true,
      }),
    );
    expect(response.body).not.toContainEqual(
      expect.objectContaining<Partial<TaskDto>>({
        isArchived: false,
      }),
    );
    expect(response.body).not.toContainEqual(
      expect.objectContaining<Partial<TaskDto>>({
        isDiscarded: true,
      }),
    );
    expect(response.body).not.toContainEqual(notedTaskFromAlice);

    /*
      Bob logs out
    */
    return logout(app, loginResponse).expect(HttpStatus.OK);
  });
});
