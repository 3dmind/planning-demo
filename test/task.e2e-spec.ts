import { HttpStatus, INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as faker from 'faker';
import * as request from 'supertest';
import urlcat from 'urlcat';
import { TaskDto } from '../src/modules/planning/dtos/task.dto';
import { PlanningModule } from '../src/modules/planning/planning.module';
import { EditTaskDto } from '../src/modules/planning/use-cases/tasks/edit-task/edit-task.dto';
import { NoteTaskDto } from '../src/modules/planning/use-cases/tasks/note-task/note-task.dto';
import { PrismaService } from '../src/prisma/prisma.service';

describe('TasksController (e2e)', () => {
  const baseUrl = '/tasks';
  const tickOffPath = '/:id/tickoff';
  const resumePath = '/:id/resume';
  const archivePath = '/:id/archive';
  const editPath = '/:id/edit';
  const discardPath = '/:id/discard';
  const activePath = '/active';
  const archivedPath = '/archived';

  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PlanningModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    const prismaService = await app.resolve<PrismaService>(PrismaService);
    await prismaService.$disconnect();
  });

  it('/tasks (GET)', async () => {
    return request(app.getHttpServer())
      .get(baseUrl)
      .expect(HttpStatus.OK);
  });

  it('/tasks (POST)', async () => {
    const text = faker.lorem.words(5);
    const dto: NoteTaskDto = { text };
    return request(app.getHttpServer())
      .post(baseUrl)
      .send(dto)
      .expect(HttpStatus.CREATED);
  });

  it('/tasks/:id/tickoff (POST)', async () => {
    const text = faker.lorem.words(5);
    const noteTaskDto: NoteTaskDto = { text };
    const response = await request(app.getHttpServer())
      .post(baseUrl)
      .send(noteTaskDto);

    const { id }: TaskDto = response.body;
    const url = urlcat(baseUrl, tickOffPath, { id });
    return request(app.getHttpServer())
      .post(url)
      .expect(HttpStatus.OK);
  });

  it('/tasks/:id/resume (POST)', async () => {
    const text = faker.lorem.words(5);
    const noteTaskDto: NoteTaskDto = { text };
    const response = await request(app.getHttpServer())
      .post(baseUrl)
      .send(noteTaskDto);
    const { id }: TaskDto = response.body;
    const urlTickOffTask = urlcat(baseUrl, tickOffPath, { id });
    await request(app.getHttpServer())
      .post(urlTickOffTask)
      .expect(HttpStatus.OK);

    const urlResumeTask = urlcat(baseUrl, resumePath, { id });
    return request(app.getHttpServer())
      .post(urlResumeTask)
      .expect(HttpStatus.OK);
  });

  it('/tasks/:id/archive (POST)', async () => {
    const text = faker.lorem.words(5);
    const noteTaskDto: NoteTaskDto = { text };
    const response = await request(app.getHttpServer())
      .post(baseUrl)
      .send(noteTaskDto);

    const { id }: TaskDto = response.body;
    const url = urlcat(baseUrl, archivePath, { id });
    return request(app.getHttpServer())
      .post(url)
      .expect(HttpStatus.OK);
  });

  it('/task/:id/edit (POST)', async () => {
    const text = faker.lorem.words(5);
    const noteTaskDto: NoteTaskDto = { text };

    const response = await request(app.getHttpServer())
      .post(baseUrl)
      .send(noteTaskDto);

    const { id }: TaskDto = response.body;
    const url = urlcat(baseUrl, editPath, { id });
    const newText = faker.lorem.words(5);
    const editTaskDto: EditTaskDto = { text: newText };
    return request(app.getHttpServer())
      .post(url)
      .send(editTaskDto)
      .expect(HttpStatus.OK);
  });

  it('/tasks/:id/discard (POST)', async () => {
    const text = faker.lorem.words(5);
    const noteTaskDto: NoteTaskDto = { text };
    const response = await request(app.getHttpServer())
      .post(baseUrl)
      .send(noteTaskDto);

    const { id }: TaskDto = response.body;
    const url = urlcat(baseUrl, discardPath, { id });
    return request(app.getHttpServer())
      .post(url)
      .expect(HttpStatus.OK);
  });

  it('/tasks/active (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get(urlcat(baseUrl, activePath))
      .expect(HttpStatus.OK);
    const tasks: TaskDto[] = response.body;

    expect(tasks.length).toBeGreaterThan(0);
  });

  it('/tasks/archived (GET)', async () => {
    const httpServer = app.getHttpServer();

    const text = faker.lorem.words(5);
    const noteTaskDto: NoteTaskDto = { text };
    const noteTaskResponse = await request(httpServer)
      .post(baseUrl)
      .send(noteTaskDto);

    const { id }: TaskDto = noteTaskResponse.body;
    await request(httpServer).post(urlcat(baseUrl, archivePath, { id }));

    const response = await request(httpServer)
      .get(urlcat(baseUrl, archivedPath))
      .expect(HttpStatus.OK);
    const tasks: TaskDto[] = response.body;

    expect(tasks.length).toBeGreaterThan(0);
  });
});
