import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as faker from 'faker';
import { TaskDto } from '../../../../src/modules/planning/dtos/task.dto';
import { PlanningModule } from '../../../../src/modules/planning/planning.module';
import { login } from '../../users/login/login';
import { logout } from '../../users/logout/logout';
import { noteTask } from './note-task';

describe('/tasks (POST)', () => {
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

  it('missing text', async () => {
    expect.assertions(1);
    const loginResponse = await login(app).expect(HttpStatus.OK);

    const response = await noteTask(app, loginResponse, null).expect(
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    expect(response.body.message).toEqual('text is null or undefined');

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it('invalid text', async () => {
    expect.assertions(1);
    const loginResponse = await login(app).expect(HttpStatus.OK);

    const response = await noteTask(app, loginResponse, '').expect(
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    expect(response.body.message).toEqual('Text is not at least 2 chars.');

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it('note new task', async () => {
    expect.assertions(1);
    const text = faker.lorem.words(5);
    const loginResponse = await login(app).expect(HttpStatus.OK);

    const response = await noteTask(app, loginResponse, text).expect(
      HttpStatus.CREATED,
    );

    expect(response.body).toMatchObject<TaskDto>({
      archivedAt: null,
      createdAt: expect.any(String),
      description: text,
      discardedAt: null,
      editedAt: null,
      id: expect.any(String),
      isArchived: false,
      isDiscarded: false,
      isTickedOff: false,
      resumedAt: null,
      tickedOffAt: null,
    });

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });
});
