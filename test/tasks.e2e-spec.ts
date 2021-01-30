import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as faker from 'faker';
import { TaskDto } from '../src/modules/planning/dtos/task.dto';
import { PlanningModule } from '../src/modules/planning/planning.module';
import { archiveTask } from './archive-task';
import { discardTask } from './discard-task';
import { editTask } from './edit-task';
import { getActiveTasks } from './get-active-tasks';
import { getArchivedTasks } from './get-archived-tasks';
import { login } from './login';
import { logout } from './logout';
import { noteTask } from './note-task';
import { resumeTask } from './resume-task';
import { tickOffTask } from './tick-off-task';

describe('TasksController (e2e)', () => {
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

  describe('/tasks (POST)', () => {
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

  describe('/tasks/:id/tickoff (POST)', () => {
    it('member not found', async () => {
      const taskId = '29077746-6161-4261-a38c-6a8e7c0e5bcc';
      const loginResponse = await login(
        app,
        'no-member-planning-demo',
        'no-member-planning-demo',
      ).expect(HttpStatus.OK);

      await tickOffTask(app, loginResponse, taskId).expect(
        HttpStatus.NOT_FOUND,
      );

      return logout(app, loginResponse).expect(HttpStatus.OK);
    });

    it('task not found', async () => {
      const taskId = '29077746-6161-4261-a38c-6a8e7c0e5bcc';
      const loginResponse = await login(app).expect(HttpStatus.OK);

      await tickOffTask(app, loginResponse, taskId).expect(
        HttpStatus.NOT_FOUND,
      );

      return logout(app, loginResponse).expect(HttpStatus.OK);
    });

    it('tick-off task', async () => {
      expect.assertions(1);
      const loginResponse = await login(app).expect(HttpStatus.OK);
      const noteTaskResponse = await noteTask(app, loginResponse).expect(
        HttpStatus.CREATED,
      );

      const response = await tickOffTask(
        app,
        loginResponse,
        noteTaskResponse.body.id,
      ).expect(HttpStatus.OK);

      expect(response.body).toMatchObject<Partial<TaskDto>>({
        tickedOffAt: expect.any(String),
        isTickedOff: true,
      });

      return logout(app, loginResponse).expect(HttpStatus.OK);
    });
  });

  describe('/tasks/:id/resume (POST)', () => {
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

  describe('/tasks/:id/edit (POST)', () => {
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

  describe('/tasks/:id/archive (POST)', () => {
    it('member not found', async () => {
      const taskId = 'f6284ef5-963c-4d5c-88a6-f7a48dc6281b';
      const loginResponse = await login(
        app,
        'no-member-planning-demo',
        'no-member-planning-demo',
      ).expect(HttpStatus.OK);

      await archiveTask(app, loginResponse, taskId).expect(
        HttpStatus.NOT_FOUND,
      );

      return logout(app, loginResponse).expect(HttpStatus.OK);
    });

    it('task not found', async () => {
      const taskId = 'f6284ef5-963c-4d5c-88a6-f7a48dc6281b';
      const loginResponse = await login(app).expect(HttpStatus.OK);

      await archiveTask(app, loginResponse, taskId).expect(
        HttpStatus.NOT_FOUND,
      );

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

  describe('/tasks/:id/discard (POST)', () => {
    it('member not found', async () => {
      const taskId = '8f262256-452b-4691-b5ce-eb590b4db147';
      const loginResponse = await login(
        app,
        'no-member-planning-demo',
        'no-member-planning-demo',
      ).expect(HttpStatus.OK);

      await discardTask(app, loginResponse, taskId).expect(
        HttpStatus.NOT_FOUND,
      );

      return logout(app, loginResponse).expect(HttpStatus.OK);
    });

    it('task not found', async () => {
      const taskId = '8f262256-452b-4691-b5ce-eb590b4db147';
      const loginResponse = await login(app).expect(HttpStatus.OK);

      await discardTask(app, loginResponse, taskId).expect(
        HttpStatus.NOT_FOUND,
      );

      return logout(app, loginResponse).expect(HttpStatus.OK);
    });

    it('discard task', async () => {
      expect.assertions(1);
      const loginResponse = await login(app).expect(HttpStatus.OK);
      const noteTaskResponse = await noteTask(app, loginResponse).expect(
        HttpStatus.CREATED,
      );

      const response = await discardTask(
        app,
        loginResponse,
        noteTaskResponse.body.id,
      ).expect(HttpStatus.OK);
      expect(response.body).toMatchObject<Partial<TaskDto>>({
        discardedAt: expect.any(String),
        isDiscarded: true,
      });

      return logout(app, loginResponse).expect(HttpStatus.OK);
    });
  });

  describe('/tasks/active (GET)', () => {
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

  describe('/tasks/archived (GET)', () => {
    it('member not found', async () => {
      const loginResponse = await login(
        app,
        'no-member-planning-demo',
        'no-member-planning-demo',
      ).expect(HttpStatus.OK);

      await getArchivedTasks(app, loginResponse).expect(HttpStatus.NOT_FOUND);

      return logout(app, loginResponse).expect(HttpStatus.OK);
    });

    it('get archived tasks', async () => {
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

      const response = await getArchivedTasks(app, loginResponse).expect(
        HttpStatus.OK,
      );
      expect(response.body).not.toContainEqual(noteTaskOneResponse.body);
      expect(response.body).not.toContainEqual(tickOffTaskTwoResponse.body);
      expect(response.body).not.toContainEqual(resumeTaskThreeResponse.body);
      expect(response.body).not.toContainEqual(editedTaskFourResponse.body);
      expect(response.body).toContainEqual(archivedTaskFiveResponse.body);
      expect(response.body).not.toContainEqual(discardedTaskSixResponse.body);

      return logout(app, loginResponse).expect(HttpStatus.OK);
    });
  });
});
