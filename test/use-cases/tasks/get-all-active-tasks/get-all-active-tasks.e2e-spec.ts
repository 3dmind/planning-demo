import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PlanningModule } from '../../../../src/modules/planning/planning.module';
import { login } from '../../users/login/login';
import { logout } from '../../users/logout/logout';
import { archiveTask } from '../archive-task/archive-task';
import { discardTask } from '../discard-task/discard-task';
import { editTask } from '../edit-task/edit-task';
import { noteTask } from '../note-task/note-task';
import { resumeTask } from '../resume-task/resume-task';
import { tickOffTask } from '../tick-off-task/tick-off-task';
import { getActiveTasks } from './get-active-tasks';

describe('/tasks/active (GET)', () => {
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

  it('member not found', async () => {
    const loginResponse = await login(
      app,
      'no-member-planning-demo',
      'no-member-planning-demo',
    ).expect(HttpStatus.OK);

    await getActiveTasks(app, loginResponse).expect(HttpStatus.NOT_FOUND);

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it('get active tasks', async () => {
    expect.assertions(6);
    const loginResponse = await login(app).expect(HttpStatus.OK);
    const noteTaskOneResponse = await noteTask(app, loginResponse).expect(
      HttpStatus.CREATED,
    );

    const noteTaskTwoResponse = await noteTask(app, loginResponse).expect(
      HttpStatus.CREATED,
    );
    const tickOffTaskTwoResponse = await tickOffTask(
      app,
      loginResponse,
      noteTaskTwoResponse.body.id,
    ).expect(HttpStatus.OK);

    const noteTaskThreeResponse = await noteTask(app, loginResponse).expect(
      HttpStatus.CREATED,
    );
    const tickOffTaskThreeResponse = await tickOffTask(
      app,
      loginResponse,
      noteTaskThreeResponse.body.id,
    ).expect(HttpStatus.OK);
    const resumeTaskThreeResponse = await resumeTask(
      app,
      loginResponse,
      tickOffTaskThreeResponse.body.id,
    ).expect(HttpStatus.OK);

    const noteTaskFourResponse = await noteTask(app, loginResponse).expect(
      HttpStatus.CREATED,
    );
    const editedTaskFourResponse = await editTask(
      app,
      loginResponse,
      noteTaskFourResponse.body.id,
    ).expect(HttpStatus.OK);

    const noteTaskFiveResponse = await noteTask(app, loginResponse).expect(
      HttpStatus.CREATED,
    );
    const archivedTaskFiveResponse = await archiveTask(
      app,
      loginResponse,
      noteTaskFiveResponse.body.id,
    ).expect(HttpStatus.OK);

    const noteTaskSixResponse = await noteTask(app, loginResponse).expect(
      HttpStatus.CREATED,
    );
    const discardedTaskSixResponse = await discardTask(
      app,
      loginResponse,
      noteTaskSixResponse.body.id,
    ).expect(HttpStatus.OK);

    const response = await getActiveTasks(app, loginResponse).expect(
      HttpStatus.OK,
    );
    expect(response.body).toContainEqual(noteTaskOneResponse.body);
    expect(response.body).toContainEqual(tickOffTaskTwoResponse.body);
    expect(response.body).toContainEqual(resumeTaskThreeResponse.body);
    expect(response.body).toContainEqual(editedTaskFourResponse.body);
    expect(response.body).not.toContainEqual(archivedTaskFiveResponse.body);
    expect(response.body).not.toContainEqual(discardedTaskSixResponse.body);

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });
});
