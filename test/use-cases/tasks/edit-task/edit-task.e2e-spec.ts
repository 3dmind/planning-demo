import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as faker from 'faker';
import { TaskDto } from '../../../../src/modules/planning/dtos/task.dto';
import { PlanningModule } from '../../../../src/modules/planning/planning.module';
import { login } from '../../users/login/login';
import { logout } from '../../users/logout/logout';
import { noteTask } from '../note-task/note-task';
import { editTask } from './edit-task';

describe('/tasks/:id/edit (POST)', () => {
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
    const taskId = '00f60ee9-9b19-4a7b-9f51-07f4511adef9';
    const loginResponse = await login(
      app,
      'no-member-planning-demo',
      'no-member-planning-demo',
    ).expect(HttpStatus.OK);

    await editTask(app, loginResponse, taskId).expect(HttpStatus.NOT_FOUND);

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it('task not found', async () => {
    const taskId = '00f60ee9-9b19-4a7b-9f51-07f4511adef9';
    const loginResponse = await login(app).expect(HttpStatus.OK);

    await editTask(app, loginResponse, taskId).expect(HttpStatus.NOT_FOUND);

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it('edit task description', async () => {
    expect.assertions(1);
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
    expect(editTaskResponse.body).toMatchObject<Partial<TaskDto>>({
      editedAt: expect.any(String),
      description: editTaskText,
    });

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });
});
