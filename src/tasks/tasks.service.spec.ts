import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from './entities/task.entity';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';
import { TaskStatus } from '../common/enums/task-status.enum';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';

describe('TasksService', () => {
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

  const mockAdminUser: User = {
    ...mockUser,
    id: 'admin-1',
    email: 'admin@example.com',
    role: UserRole.ADMIN,
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

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
    softRemove: jest.fn(),
    createQueryBuilder: jest.fn(() => ({
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getRepositoryToken(Task),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should successfully create a task', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
        status: TaskStatus.TODO,
      };

      mockRepository.create.mockReturnValue(mockTask);
      mockRepository.save.mockResolvedValue(mockTask);

      const result = await service.create(createTaskDto, mockUser);

      expect(result).toEqual(mockTask);
      expect(mockRepository.create).toHaveBeenCalledWith({
        ...createTaskDto,
        ownerId: mockUser.id,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockTask);
    });

    it('should throw InternalServerErrorException on save failure', async () => {
      const createTaskDto: CreateTaskDto = {
        title: 'New Task',
        description: 'New Description',
      };

      mockRepository.create.mockReturnValue(mockTask);
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createTaskDto, mockUser)).rejects.toThrow(
        'Failed to create task',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated tasks for regular user', async () => {
      const filterDto: FilterTaskDto = { page: 1, limit: 10 };
      const tasks = [mockTask];
      const total = 1;

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([tasks, total]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll(filterDto, mockUser);

      expect(result).toEqual({ data: tasks, total });
      expect(queryBuilder.where).toHaveBeenCalledWith('task.ownerId = :userId', {
        userId: mockUser.id,
      });
    });

    it('should return all tasks for admin user', async () => {
      const filterDto: FilterTaskDto = { page: 1, limit: 10 };
      const tasks = [mockTask];
      const total = 1;

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([tasks, total]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.findAll(filterDto, mockAdminUser);

      expect(result).toEqual({ data: tasks, total });
      expect(queryBuilder.where).not.toHaveBeenCalled();
    });

    it('should filter by search term', async () => {
      const filterDto: FilterTaskDto = { search: 'test', page: 1, limit: 10 };

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findAll(filterDto, mockUser);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith(
        '(task.title ILIKE :search OR task.description ILIKE :search)',
        { search: '%test%' },
      );
    });

    it('should filter by status', async () => {
      const filterDto: FilterTaskDto = { status: TaskStatus.TODO, page: 1, limit: 10 };

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await service.findAll(filterDto, mockUser);

      expect(queryBuilder.andWhere).toHaveBeenCalledWith('task.status = :status', {
        status: TaskStatus.TODO,
      });
    });
  });

  describe('findOne', () => {
    it('should return a task for the owner', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.findOne(mockTask.id, mockUser);

      expect(result).toEqual(mockTask);
      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { id: mockTask.id } });
    });

    it('should return a task for admin', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);

      const result = await service.findOne(mockTask.id, mockAdminUser);

      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id', mockUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not owner or admin', async () => {
      const otherUser: User = { ...mockUser, id: 'other-user' };
      mockRepository.findOne.mockResolvedValue(mockTask);

      await expect(service.findOne(mockTask.id, otherUser)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should successfully update a task', async () => {
      const updateTaskDto: UpdateTaskDto = { title: 'Updated Task' };
      const updatedTask = { ...mockTask, ...updateTaskDto };

      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.save.mockResolvedValue(updatedTask);

      const result = await service.update(mockTask.id, updateTaskDto, mockUser);

      expect(result).toEqual(updatedTask);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should allow admin to update any task', async () => {
      const updateTaskDto: UpdateTaskDto = { title: 'Updated by Admin' };
      const updatedTask = { ...mockTask, ...updateTaskDto };

      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.save.mockResolvedValue(updatedTask);

      const result = await service.update(mockTask.id, updateTaskDto, mockAdminUser);

      expect(result).toEqual(updatedTask);
    });

    it('should throw ForbiddenException if non-owner tries to update', async () => {
      const otherUser: User = { ...mockUser, id: 'other-user' };
      mockRepository.findOne.mockResolvedValue(mockTask);

      await expect(service.update(mockTask.id, {}, otherUser)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update('nonexistent-id', {}, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should successfully soft delete a task', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.softRemove.mockResolvedValue(mockTask);

      await service.remove(mockTask.id, mockUser);

      expect(mockRepository.softRemove).toHaveBeenCalledWith(mockTask);
    });

    it('should allow admin to delete any task', async () => {
      mockRepository.findOne.mockResolvedValue(mockTask);
      mockRepository.softRemove.mockResolvedValue(mockTask);

      await service.remove(mockTask.id, mockAdminUser);

      expect(mockRepository.softRemove).toHaveBeenCalledWith(mockTask);
    });

    it('should throw ForbiddenException if non-owner tries to delete', async () => {
      const otherUser: User = { ...mockUser, id: 'other-user' };
      mockRepository.findOne.mockResolvedValue(mockTask);

      await expect(service.remove(mockTask.id, otherUser)).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if task not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('nonexistent-id', mockUser)).rejects.toThrow(NotFoundException);
    });
  });
});
