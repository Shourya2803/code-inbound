import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { AllExceptionsFilter } from './../src/common/filters/all-exceptions.filter';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let authToken: string;
  let userId: string;
  let taskId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth Flow', () => {
    const testUser = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'Password123!',
    };

    it('/auth/register (POST) - should register a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('user');
          expect(res.body.user.email).toBe(testUser.email);
          expect(res.body.user).not.toHaveProperty('password');
          userId = res.body.user.id;
          authToken = res.body.accessToken;
        });
    });

    it('/auth/register (POST) - should fail with duplicate email', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('already exists');
        });
    });

    it('/auth/register (POST) - should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'invalid-email',
          username: 'test',
          password: 'short',
        })
        .expect(400);
    });

    it('/auth/login (POST) - should login with correct credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('accessToken');
          expect(res.body).toHaveProperty('user');
          authToken = res.body.accessToken;
        });
    });

    it('/auth/login (POST) - should fail with incorrect password', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123!',
        })
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toContain('Invalid credentials');
        });
    });

    it('/auth/login (POST) - should fail with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);
    });
  });

  describe('Tasks CRUD', () => {
    const newTask = {
      title: 'Test Task',
      description: 'This is a test task',
      status: 'TODO',
    };

    it('/tasks (POST) - should create a new task', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newTask)
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe(newTask.title);
          expect(res.body.description).toBe(newTask.description);
          expect(res.body.status).toBe(newTask.status);
          taskId = res.body.id;
        });
    });

    it('/tasks (POST) - should fail without authentication', () => {
      return request(app.getHttpServer()).post('/tasks').send(newTask).expect(401);
    });

    it('/tasks (POST) - should fail with invalid data', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: '', // Empty title should fail
        })
        .expect(400);
    });

    it('/tasks (GET) - should get all tasks', () => {
      return request(app.getHttpServer())
        .get('/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
          expect(Array.isArray(res.body.data)).toBe(true);
          expect(res.body.data.length).toBeGreaterThan(0);
        });
    });

    it('/tasks (GET) - should support pagination', () => {
      return request(app.getHttpServer())
        .get('/tasks?page=1&limit=5')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('total');
        });
    });

    it('/tasks (GET) - should support filtering by status', () => {
      return request(app.getHttpServer())
        .get('/tasks?status=TODO')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.data.every((task) => task.status === 'TODO')).toBe(true);
        });
    });

    it('/tasks (GET) - should support search', () => {
      return request(app.getHttpServer())
        .get('/tasks?search=Test')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);
    });

    it('/tasks/:id (GET) - should get a specific task', () => {
      return request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(taskId);
          expect(res.body.title).toBe(newTask.title);
        });
    });

    it('/tasks/:id (GET) - should fail with invalid task id', () => {
      return request(app.getHttpServer())
        .get('/tasks/invalid-uuid')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('/tasks/:id (PATCH) - should update a task', () => {
      const updateData = {
        title: 'Updated Task Title',
        status: 'IN_PROGRESS',
      };

      return request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)
        .expect((res) => {
          expect(res.body.title).toBe(updateData.title);
          expect(res.body.status).toBe(updateData.status);
        });
    });

    it('/tasks/:id (PATCH) - should allow partial updates', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'DONE' })
        .expect(200)
        .expect((res) => {
          expect(res.body.status).toBe('DONE');
        });
    });

    it('/tasks/:id (PATCH) - should fail with invalid data', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'INVALID_STATUS' })
        .expect(400);
    });

    it('/tasks/:id (DELETE) - should delete a task', () => {
      return request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(204);
    });

    it('/tasks/:id (GET) - should not find deleted task', () => {
      return request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('Authorization', () => {
    let user1Token: string;
    let user2Token: string;
    let user1TaskId: string;

    beforeAll(async () => {
      // Create first user
      const user1 = await request(app.getHttpServer()).post('/auth/register').send({
        email: 'user1@example.com',
        username: 'user1',
        password: 'Password123!',
      });
      user1Token = user1.body.accessToken;

      // Create second user
      const user2 = await request(app.getHttpServer()).post('/auth/register').send({
        email: 'user2@example.com',
        username: 'user2',
        password: 'Password123!',
      });
      user2Token = user2.body.accessToken;

      // Create task for user1
      const task = await request(app.getHttpServer())
        .post('/tasks')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          title: 'User 1 Task',
          description: 'This task belongs to user 1',
        });
      user1TaskId = task.body.id;
    });

    it('should prevent user2 from accessing user1 task', () => {
      return request(app.getHttpServer())
        .get(`/tasks/${user1TaskId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403);
    });

    it('should prevent user2 from updating user1 task', () => {
      return request(app.getHttpServer())
        .patch(`/tasks/${user1TaskId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ title: 'Hacked title' })
        .expect(403);
    });

    it('should prevent user2 from deleting user1 task', () => {
      return request(app.getHttpServer())
        .delete(`/tasks/${user1TaskId}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .expect(403);
    });
  });
});
