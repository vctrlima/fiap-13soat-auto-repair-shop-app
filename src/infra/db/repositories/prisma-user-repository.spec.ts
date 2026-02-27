import {
  CreateUserRepository,
  DeleteUserRepository,
  GetAllUsersRepository,
  GetUserByIdRepository,
  UpdateUserRepository,
} from '@/application/protocols/db';
import { Role } from '@/domain/enums';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { PrismaUserRepository } from './prisma-user-repository';

type UserRepository = CreateUserRepository &
  GetAllUsersRepository &
  GetUserByIdRepository &
  UpdateUserRepository &
  DeleteUserRepository;

const prismaClientMock = (): PrismaClient =>
  ({
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  } as PrismaClient & { user: any });

describe('PrismaUserRepository', () => {
  let prisma: PrismaClient;
  let prismaUserRepository: UserRepository;

  beforeEach(() => {
    prisma = prismaClientMock();
    prismaUserRepository = new PrismaUserRepository(prisma);
  });

  it('should be defined', () => {
    expect(prismaUserRepository).toBeTruthy();
  });

  it('should save a new user on the database', async () => {
    const params: CreateUserRepository.Params = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      password: faker.internet.password(),
      role: Role.Default,
    };
    const createdUser = { id: faker.string.uuid(), createdAt: new Date(), updatedAt: null, ...params };
    const expectedUser = {
      id: createdUser.id,
      name: createdUser.name,
      email: createdUser.email,
      role: createdUser.role,
      createdAt: createdUser.createdAt,
      updatedAt: createdUser.updatedAt,
    };
    jest.spyOn(prisma.user, 'create').mockResolvedValue(createdUser);

    const response = await prismaUserRepository.create(params);

    expect(prisma.user.create).toHaveBeenCalledWith({ data: params });
    expect(response).toEqual(expectedUser);
  });

  it('should not save a new user with an existing email', async () => {
    const params: CreateUserRepository.Params = {
      name: faker.person.fullName(),
      email: 'exitent@mail.com',
      password: faker.internet.password(),
      role: Role.Default,
    };
    jest
      .spyOn(prisma.user, 'create')
      .mockRejectedValue(new Error('Unique constraint failed on the fields: (`email`)'));

    const responsePromise = prismaUserRepository.create(params);

    await expect(responsePromise).rejects.toThrow('Unique constraint failed on the fields: (`email`)');
    expect(prisma.user.create).toHaveBeenCalledWith({ data: params });
  });

  it('should return all users with pagination', async () => {
    const params: GetAllUsersRepository.Params = {
      page: 1,
      limit: 10,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: Role.Admin,
    };
    const items = [
      {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: Role.Admin,
        createdAt: new Date(),
        updatedAt: null,
      },
    ];
    const result: GetAllUsersRepository.Result = {
      content: items,
      total: 1,
      page: params.page,
      limit: params.limit,
      totalPages: 1,
    };
    jest
      .spyOn(prisma.user, 'findMany')
      .mockResolvedValueOnce(items.map((item) => ({ ...item, password: faker.internet.password() })));
    jest.spyOn(prisma.user, 'count').mockResolvedValueOnce(1);

    const response = await prismaUserRepository.getAll(params);

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
      where: {
        name: { contains: params.name, mode: 'insensitive' },
        email: { contains: params.email, mode: 'insensitive' },
        role: params.role,
      },
    });
    expect(response).toEqual(result);
  });

  it('should return all users without filters', async () => {
    const params: GetAllUsersRepository.Params = {
      page: 1,
      limit: 10,
    };
    const items = [
      {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        role: Role.Default,
        createdAt: new Date(),
        updatedAt: null,
      },
    ];
    const result: GetAllUsersRepository.Result = {
      content: items,
      total: 1,
      page: params.page,
      limit: params.limit,
      totalPages: 1,
    };
    jest
      .spyOn(prisma.user, 'findMany')
      .mockResolvedValueOnce(items.map((item) => ({ ...item, password: faker.internet.password() })));
    jest.spyOn(prisma.user, 'count').mockResolvedValueOnce(1);

    const response = await prismaUserRepository.getAll(params);

    expect(prisma.user.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
      where: {},
    });
    expect(response).toEqual(result);
  });

  it('should return a user by id', async () => {
    const params: GetUserByIdRepository.Params = { id: faker.string.uuid() };
    const user = {
      id: params.id,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: Role.Default,
      createdAt: new Date(),
      updatedAt: null,
    };
    jest
      .spyOn(prisma.user, 'findUnique')
      .mockResolvedValueOnce({ ...user, password: faker.internet.password() });

    const response = await prismaUserRepository.getById(params);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: params.id } });
    expect(response).toEqual(user);
  });

  it('should throw an error if user to get by id is not found', async () => {
    const params: GetUserByIdRepository.Params = { id: faker.string.uuid() };
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);

    const responsePromise = prismaUserRepository.getById(params);

    await expect(responsePromise).rejects.toThrow('Not found error');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: params.id } });
  });

  it('should update an existing user', async () => {
    const params: UpdateUserRepository.Params = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: Role.Admin,
    };
    const updatedUser = {
      id: params.id,
      name: params.name,
      email: params.email,
      role: params.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const existingUser = { ...updatedUser, password: faker.internet.password() };
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(existingUser as any);
    jest.spyOn(prisma.user, 'update').mockResolvedValueOnce(existingUser as any);

    const response = await prismaUserRepository.update(params);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: params.id },
      data: {
        id: params.id,
        name: params.name,
        email: params.email,
        role: params.role,
      },
    });
    expect(response).toEqual(updatedUser);
  });

  it('should throw an error if user to update is not found', async () => {
    const params: UpdateUserRepository.Params = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: Role.Admin,
    };
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);

    const responsePromise = prismaUserRepository.update(params);

    await expect(responsePromise).rejects.toThrow('Not found error');
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: params.id } });
  });

  it('should delete an existing user', async () => {
    const params: DeleteUserRepository.Params = { id: faker.string.uuid() };
    const deletedUser = {
      id: params.id,
      name: faker.person.fullName(),
      password: faker.internet.password(),
      email: faker.internet.email(),
      role: Role.Default,
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(deletedUser);

    await prismaUserRepository.delete(params);

    expect(prisma.user.delete).toHaveBeenCalledWith({ where: { id: params.id } });
  });

  it('should throw an error if user to delete is not found', async () => {
    const params: DeleteUserRepository.Params = { id: faker.string.uuid() };
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
    jest.spyOn(prisma.user, 'delete').mockRejectedValueOnce(new Error('Not found error'));

    const responsePromise = prismaUserRepository.delete(params);

    await expect(responsePromise).rejects.toThrow('Not found error');
    expect(prisma.user.delete).not.toHaveBeenCalled();
  });
});
