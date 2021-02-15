import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TaskDto } from '../../../../src/modules/planning/dtos/task.dto';
import { PlanningModule } from '../../../../src/modules/planning/planning.module';
import { login } from '../../users/login/login';
import { logout } from '../../users/logout/logout';
import { noteTask } from '../note-task/note-task';
import { tickOffTask } from '../tick-off-task/tick-off-task';
import { resumeTask } from './resume-task';

describe('/tasks/:id/resume (POST)', () => {
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
    const taskId = '68b71a95-e59b-446f-ac81-938648dc3781';
    const loginResponse = await login(
      app,
      'no-member-planning-demo',
      'no-member-planning-demo',
    ).expect(HttpStatus.OK);

    await resumeTask(app, loginResponse, taskId).expect(HttpStatus.NOT_FOUND);

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it('task not found', async () => {
    const taskId = '68b71a95-e59b-446f-ac81-938648dc3781';
    const loginResponse = await login(app).expect(HttpStatus.OK);

    await resumeTask(app, loginResponse, taskId).expect(HttpStatus.NOT_FOUND);

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it('resume task', async () => {
    expect.assertions(2);
    const loginResponse = await login(app).expect(HttpStatus.OK);
    const noteTaskResponse = await noteTask(app, loginResponse).expect(
      HttpStatus.CREATED,
    );

    const tickOffTaskResponse = await tickOffTask(
      app,
      loginResponse,
      noteTaskResponse.body.id,
    ).expect(HttpStatus.OK);
    expect(tickOffTaskResponse.body).toMatchObject<Partial<TaskDto>>({
      tickedOffAt: expect.any(String),
      isTickedOff: true,
    });

    const response = await resumeTask(
      app,
      loginResponse,
      noteTaskResponse.body.id,
    ).expect(HttpStatus.OK);
    expect(response.body).toMatchObject<Partial<TaskDto>>({
      resumedAt: expect.any(String),
      isTickedOff: false,
    });

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });
});
