import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TaskDto } from '../../../../src/modules/planning/dtos/task.dto';
import { PlanningModule } from '../../../../src/modules/planning/planning.module';
import { login } from '../../users/login/login';
import { logout } from '../../users/logout/logout';
import { noteTask } from '../note-task/note-task';
import { archiveTask } from './archive-task';

describe('/tasks/:id/archive (POST)', () => {
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
    const taskId = 'f6284ef5-963c-4d5c-88a6-f7a48dc6281b';
    const loginResponse = await login(
      app,
      'no-member-planning-demo',
      'no-member-planning-demo',
    ).expect(HttpStatus.OK);

    await archiveTask(app, loginResponse, taskId).expect(HttpStatus.NOT_FOUND);

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it('task not found', async () => {
    const taskId = 'f6284ef5-963c-4d5c-88a6-f7a48dc6281b';
    const loginResponse = await login(app).expect(HttpStatus.OK);

    await archiveTask(app, loginResponse, taskId).expect(HttpStatus.NOT_FOUND);

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it('archive task', async () => {
    expect.assertions(1);
    const loginResponse = await login(app).expect(HttpStatus.OK);
    const noteTaskResponse = await noteTask(app, loginResponse).expect(
      HttpStatus.CREATED,
    );

    const response = await archiveTask(
      app,
      loginResponse,
      noteTaskResponse.body.id,
    );
    expect(response.body).toMatchObject<Partial<TaskDto>>({
      archivedAt: expect.any(String),
      isArchived: true,
    });

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });
});
