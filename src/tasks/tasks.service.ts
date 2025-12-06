import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { FilterTaskDto } from './dto/filter-task.dto';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../common/enums/user-role.enum';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  async create(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    const task = this.taskRepository.create({
      ...createTaskDto,
      ownerId: user.id,
    });

    try {
      return await this.taskRepository.save(task);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create task');
    }
  }

  async findAll(filterDto: FilterTaskDto, user: User): Promise<{ data: Task[]; total: number }> {
    const { search, status, page = 1, limit = 10 } = filterDto;

    const query = this.taskRepository.createQueryBuilder('task');

    // Non-admin users can only see their own tasks
    if (user.role !== UserRole.ADMIN) {
      query.where('task.ownerId = :userId', { userId: user.id });
    }

    if (search) {
      query.andWhere('(task.title ILIKE :search OR task.description ILIKE :search)', {
        search: `%${search}%`,
      });
    }

    if (status) {
      query.andWhere('task.status = :status', { status });
    }

    query
      .orderBy('task.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [data, total] = await query.getManyAndCount();

    return { data, total };
  }

  async findOne(id: string, user: User): Promise<Task> {
    const task = await this.taskRepository.findOne({ where: { id } });

    if (!task) {
      throw new NotFoundException(`Task with ID "${id}" not found`);
    }

    // Check ownership or admin role
    if (user.role !== UserRole.ADMIN && task.ownerId !== user.id) {
      throw new ForbiddenException('You do not have permission to access this task');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, user: User): Promise<Task> {
    const task = await this.findOne(id, user);

    // Check ownership for non-admin users
    if (user.role !== UserRole.ADMIN && task.ownerId !== user.id) {
      throw new ForbiddenException('You do not have permission to update this task');
    }

    Object.assign(task, updateTaskDto);

    try {
      return await this.taskRepository.save(task);
    } catch (error) {
      throw new InternalServerErrorException('Failed to update task');
    }
  }

  async remove(id: string, user: User): Promise<void> {
    const task = await this.findOne(id, user);

    // Check ownership for non-admin users
    if (user.role !== UserRole.ADMIN && task.ownerId !== user.id) {
      throw new ForbiddenException('You do not have permission to delete this task');
    }

    try {
      // Soft delete
      await this.taskRepository.softRemove(task);
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete task');
    }
  }
}
