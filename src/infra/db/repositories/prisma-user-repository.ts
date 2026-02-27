import {
  AuthenticateUserRepository,
  CreateUserRepository,
  DeleteUserRepository,
  GetAllUsersRepository,
  GetUserByEmailRepository,
  GetUserByIdRepository,
  UpdateUserRepository,
} from '@/application/protocols/db';
import { UserRepositoryMapper } from '@/infra/db/mappers';
import { UserRepositoryType } from '@/infra/db/types';
import { NotFoundError } from '@/presentation/errors';
import { PrismaClient } from '@prisma/client';

type UserRepository = AuthenticateUserRepository &
  CreateUserRepository &
  GetAllUsersRepository &
  GetUserByEmailRepository &
  GetUserByIdRepository &
  UpdateUserRepository &
  DeleteUserRepository;

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  public async create(params: CreateUserRepository.Params): Promise<CreateUserRepository.Result> {
    const saved = await this.prisma.user.create({ data: { ...params } });
    return UserRepositoryMapper.dataToEntity(saved);
  }

  public async getAll(params: GetAllUsersRepository.Params): Promise<GetAllUsersRepository.Result> {
    const query = {
      skip: (params.page - 1) * params.limit,
      take: params.limit,
      orderBy: { [params.orderBy || 'createdAt']: params.orderDirection || 'desc' },
    };
    const where = {};
    if (params.name) {
      Object.assign(where, { name: { contains: params.name, mode: 'insensitive' } });
    }
    if (params.email) {
      Object.assign(where, { email: { contains: params.email, mode: 'insensitive' } });
    }
    if (params.role) {
      Object.assign(where, { role: params.role });
    }
    Object.assign(query, { where });
    const items = this.prisma.user.findMany(query);
    const total = this.prisma.user.count({ where });
    return Promise.all([items, total]).then(([content, total]) => ({
      content: content.map((user: UserRepositoryType) => UserRepositoryMapper.dataToEntity(user)),
      total: total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    }));
  }

  public async getById(params: GetUserByIdRepository.Params): Promise<GetUserByIdRepository.Result> {
    const user = await this.prisma.user.findUnique({ where: { id: params.id } });
    if (!user) throw new NotFoundError('User not found');
    return UserRepositoryMapper.dataToEntity(user);
  }

  public async update(params: UpdateUserRepository.Params): Promise<UpdateUserRepository.Result> {
    const existing = await this.getById({ id: params.id });
    if (!existing) throw new NotFoundError('User not found');
    const user = await this.prisma.user.update({
      where: { id: existing.id },
      data: { ...params, id: existing.id },
    });
    return UserRepositoryMapper.dataToEntity(user);
  }

  public async delete(params: DeleteUserRepository.Params): Promise<DeleteUserRepository.Result> {
    const existing = await this.getById({ id: params.id });
    if (!existing) throw new NotFoundError('User not found');
    await this.prisma.user.delete({ where: { id: existing.id } });
  }

  public async getByEmail(params: GetUserByEmailRepository.Params): Promise<GetUserByEmailRepository.Result> {
    const user = await this.prisma.user.findUnique({ where: { email: params.email } });
    return user ? UserRepositoryMapper.dataToEntityWithPassword(user) : null;
  }

  public async authenticate(
    params: AuthenticateUserRepository.Params
  ): Promise<AuthenticateUserRepository.Result> {
    return await this.getByEmail({ email: params.email });
  }
}
