import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as faker from 'faker';
import { AppModule } from '../../../../src/app/app.module';
import { login } from '../../users/login/login';
import { logout } from '../../users/logout/logout';
import { noteTask } from '../note-task/note-task';
import { assignTask } from './assign-task';

describe('/tasks/:id/assign (PUT)', () => {
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

  it(`should respond with ${HttpStatus.NOT_FOUND} if the member cannot be found`, async () => {
    const taskId = faker.random.uuid();
    const memberId = faker.random.uuid();
    const loginResponse = await login(app, 'no-member-planning-demo', 'no-member-planning-demo').expect(HttpStatus.OK);

    await assignTask(app, loginResponse, taskId, memberId).expect(HttpStatus.NOT_FOUND);

    return logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);
  });

  it(`should respond with ${HttpStatus.NOT_FOUND} if the task cannot be found`, async () => {
    const taskId = faker.random.uuid();
    const memberId = 'a995c0db-3df0-4ae8-920d-d2b8b85146da';
    const loginResponse = await login(app).expect(HttpStatus.OK);

    await assignTask(app, loginResponse, taskId, memberId).expect(HttpStatus.NOT_FOUND);

    return logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);
  });

  it(`should respond with ${HttpStatus.OK} if the task is already assigned to member`, async () => {
    const memberId = '878e77d6-39ba-4367-ae0f-1e5c32d59b84';
    const loginResponse = await login(app, 'alice', 'alice1234').expect(HttpStatus.OK);
    const noteTaskResponse = await noteTask(app, loginResponse).expect(HttpStatus.CREATED);
    await assignTask(app, loginResponse, noteTaskResponse.body.id, memberId).expect(HttpStatus.OK);

    await assignTask(app, loginResponse, noteTaskResponse.body.id, memberId).expect(HttpStatus.OK);

    return logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);
  });

  it(`should respond with ${HttpStatus.OK} if the task was successfully assign`, async () => {
    const memberId = '878e77d6-39ba-4367-ae0f-1e5c32d59b84';
    const loginResponse = await login(app, 'alice', 'alice1234').expect(HttpStatus.OK);
    const noteTaskResponse = await noteTask(app, loginResponse).expect(HttpStatus.CREATED);

    await assignTask(app, loginResponse, noteTaskResponse.body.id, memberId).expect(HttpStatus.OK);

    return logout(app, loginResponse).expect(HttpStatus.NO_CONTENT);
  });
});
