import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { TaskStatus } from '../common/enums/task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { Task } from './entities/task.entity';

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockUser: User = {
    id: 'user-1',
    email: 'test@example.com',
    username: 'testuser',
    password: 'hashedpassword',
    role: UserRole.USER,
    tasks: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test Description',
    status: TaskStatus.TODO,
    owner: mockUser,
    ownerId: mockUser.id,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  const mockTasksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.TODO,
      };

      mockTasksService.create.mockResolvedValue(mockTask);

      const result = await controller.create(createTaskDto, mockUser);

      expect(result).toEqual(mockTask);
      expect(service.create).toHaveBeenCalledWith(createTaskDto, mockUser);
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks', async () => {
      const filterDto: FilterTaskDto = { page: 1, limit: 10 };
      const expectedResult = {
        data: [mockTask],
        total: 1,
      };

      mockTasksService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(filterDto, mockUser);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(filterDto, mockUser);
    });

    it('should handle filter parameters', async () => {
      const filterDto: FilterTaskDto = {
        search: 'test',
        status: TaskStatus.TODO,
        page: 2,
        limit: 5,
      };
      const expectedResult = { data: [], total: 0 };

      mockTasksService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll(filterDto, mockUser);

      expect(result).toEqual(expectedResult);
      expect(service.findAll).toHaveBeenCalledWith(filterDto, mockUser);
    });
  });

  describe('findOne', () => {
    it('should return a single task', async () => {
      mockTasksService.findOne.mockResolvedValue(mockTask);

      const result = await controller.findOne(mockTask.id, mockUser);

      expect(result).toEqual(mockTask);
      expect(service.findOne).toHaveBeenCalledWith(mockTask.id, mockUser);
    });
  });

  describe('update', () => {
    it('should update a task', async () => {
      const updateTaskDto: UpdateTaskDto = {
        title: 'Updated Task',
        status: TaskStatus.IN_PROGRESS,
      };
      const updatedTask = { ...mockTask, ...updateTaskDto };

      mockTasksService.update.mockResolvedValue(updatedTask);

      const result = await controller.update(mockTask.id, updateTaskDto, mockUser);

      expect(result).toEqual(updatedTask);
      expect(service.update).toHaveBeenCalledWith(mockTask.id, updateTaskDto, mockUser);
    });

    it('should handle partial updates', async () => {
      const updateTaskDto: UpdateTaskDto = { status: TaskStatus.DONE };
      const updatedTask = { ...mockTask, status: TaskStatus.DONE };

      mockTasksService.update.mockResolvedValue(updatedTask);

      const result = await controller.update(mockTask.id, updateTaskDto, mockUser);

      expect(result).toEqual(updatedTask);
      expect(service.update).toHaveBeenCalledWith(mockTask.id, updateTaskDto, mockUser);
    });
  });

  describe('remove', () => {
    it('should delete a task', async () => {
      mockTasksService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(mockTask.id, mockUser);

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(mockTask.id, mockUser);
    });
  });
});
