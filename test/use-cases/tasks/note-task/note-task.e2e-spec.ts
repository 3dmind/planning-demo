import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as faker from 'faker';
import { AppModule } from '../../../../src/app/app.module';
import { TaskDto } from '../../../../src/modules/planning/dtos/task.dto';
import { login } from '../../users/login/login';
import { logout } from '../../users/logout/logout';
import { noteTask } from './note-task';

describe('/tasks (POST)', () => {
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

  it(`should respond with ${HttpStatus.UNPROCESSABLE_ENTITY} if the description is missing`, async () => {
    const loginResponse = await login(app).expect(HttpStatus.OK);

    const response = await noteTask(app, loginResponse, null).expect(
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    expect.assertions(1);
    expect(response.body.message).toEqual('text is null or undefined');

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it(`should respond with ${HttpStatus.UNPROCESSABLE_ENTITY} if the description is invalid`, async () => {
    const loginResponse = await login(app).expect(HttpStatus.OK);
    const response = await noteTask(app, loginResponse, '').expect(
      HttpStatus.UNPROCESSABLE_ENTITY,
    );

    expect.assertions(1);
    expect(response.body.message).toEqual('Text is not at least 2 chars.');

    return logout(app, loginResponse).expect(HttpStatus.OK);
  });

  it(`should respond with ${HttpStatus.CREATED} if the task was successfully noted`, async () => {
    const text = faker.lorem.words(5);
    const loginResponse = await login(app).expect(HttpStatus.OK);

    const response = await noteTask(app, loginResponse, text).expect(
      HttpStatus.CREATED,
    );

    expect.assertions(1);
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
