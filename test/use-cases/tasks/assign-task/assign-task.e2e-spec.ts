import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as faker from 'faker';
import { AppModule } from '../../../../src/app/app.module';
import { login } from '../../users/login/login';
import { logout } from '../../users/logout/logout';
import { noteTask } from '../note-task/note-task';
import { assignTask } from './assign-task';

describe('/tasks/:id/assign (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = await module.createNestApplication().init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('no member found for user', async () => {
    const taskId = faker.random.uuid();
    const memberId = faker.random.uuid();
    const loginResponse = await login(
      app,
      'no-member-planning-demo',
      'no-member-planning-demo',
    ).expect(HttpStatus.OK);

    await assignTask(app, loginResponse, taskId, memberId).expect(
      HttpStatus.NOT_FOUND,
    );

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it('member not found', async () => {
    const taskId = faker.random.uuid();
    const memberId = faker.random.uuid();
    const loginResponse = await login(app).expect(HttpStatus.OK);

    await assignTask(app, loginResponse, taskId, memberId).expect(
      HttpStatus.NOT_FOUND,
    );

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it('task not found', async () => {
    const taskId = faker.random.uuid();
    const memberId = 'a995c0db-3df0-4ae8-920d-d2b8b85146da';
    const loginResponse = await login(app).expect(HttpStatus.OK);

    await assignTask(app, loginResponse, taskId, memberId).expect(
      HttpStatus.NOT_FOUND,
    );

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it('assign task to member', async () => {
    const memberId = '878e77d6-39ba-4367-ae0f-1e5c32d59b84';
    const loginResponse = await login(app, 'alice', 'alice1234').expect(
      HttpStatus.OK,
    );
    const noteTaskResponse = await noteTask(app, loginResponse).expect(
      HttpStatus.CREATED,
    );

    await assignTask(
      app,
      loginResponse,
      noteTaskResponse.body.id,
      memberId,
    ).expect(HttpStatus.OK);

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it('task is already assigned to member', async () => {
    const memberId = '878e77d6-39ba-4367-ae0f-1e5c32d59b84';
    const loginResponse = await login(app, 'alice', 'alice1234').expect(
      HttpStatus.OK,
    );
    const noteTaskResponse = await noteTask(app, loginResponse).expect(
      HttpStatus.CREATED,
    );
    await assignTask(
      app,
      loginResponse,
      noteTaskResponse.body.id,
      memberId,
    ).expect(HttpStatus.OK);

    await assignTask(
      app,
      loginResponse,
      noteTaskResponse.body.id,
      memberId,
    ).expect(HttpStatus.UNPROCESSABLE_ENTITY);

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });
});
