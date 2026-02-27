import {
  CreateServiceRepository,
  DeleteServiceRepository,
  GetAllServicesRepository,
  GetServiceByIdRepository,
  UpdateServiceRepository,
} from '@/application/protocols/db';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { PrismaServiceRepository } from './prisma-service-repository';

type ServiceRepository = CreateServiceRepository &
  GetAllServicesRepository &
  GetServiceByIdRepository &
  UpdateServiceRepository &
  DeleteServiceRepository;

const prismaClientMock = (): PrismaClient =>
  ({
    service: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  } as PrismaClient & { service: any });

describe('PrismaServiceRepository', () => {
  let prisma: PrismaClient;
  let prismaServiceRepository: ServiceRepository;

  beforeEach(() => {
    prisma = prismaClientMock();
    prismaServiceRepository = new PrismaServiceRepository(prisma);
  });

  it('should be defined', () => {
    expect(prismaServiceRepository).toBeTruthy();
  });

  it('should save a new service on the database', async () => {
    const params: CreateServiceRepository.Params = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
    };
    const createdItem = {
      id: faker.string.uuid(),
      name: params.name,
      description: params.description || null,
      price: params.price,
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(prisma.service, 'create').mockResolvedValue(createdItem);

    const response = await prismaServiceRepository.create(params);

    expect(prisma.service.create).toHaveBeenCalledWith({
      data: { ...params, description: params.description || null },
    });
    expect(response).toEqual(createdItem);
  });

  it('should save a new service without description', async () => {
    const params: CreateServiceRepository.Params = {
      name: faker.commerce.productName(),
      price: Number(faker.commerce.price()),
    };
    const createdItem = {
      id: faker.string.uuid(),
      name: params.name,
      description: null,
      price: params.price,
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(prisma.service, 'create').mockResolvedValue(createdItem);

    const response = await prismaServiceRepository.create(params);

    expect(prisma.service.create).toHaveBeenCalledWith({
      data: { ...params, description: null },
    });
    expect(response).toEqual(createdItem);
  });

  it('should return all services with pagination', async () => {
    const params: GetAllServicesRepository.Params = {
      page: 1,
      limit: 10,
      name: faker.commerce.productName(),
    };
    const items = [
      {
        id: faker.string.uuid(),
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price()),
        createdAt: new Date(),
        updatedAt: null,
      },
    ];
    const result: GetAllServicesRepository.Result = {
      content: items,
      total: 1,
      page: params.page,
      limit: params.limit,
      totalPages: 1,
    };
    jest.spyOn(prisma.service, 'findMany').mockResolvedValueOnce(items);
    jest.spyOn(prisma.service, 'count').mockResolvedValueOnce(1);

    const response = await prismaServiceRepository.getAll(params);

    expect(prisma.service.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
      where: { name: { contains: params.name, mode: 'insensitive' } },
    });
    expect(response).toEqual(result);
  });

  it('should return all services without filters', async () => {
    const params: GetAllServicesRepository.Params = {
      page: 1,
      limit: 10,
    };
    const items = [
      {
        id: faker.string.uuid(),
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price()),
        createdAt: new Date(),
        updatedAt: null,
      },
    ];
    const result: GetAllServicesRepository.Result = {
      content: items,
      total: 1,
      page: params.page,
      limit: params.limit,
      totalPages: 1,
    };
    jest.spyOn(prisma.service, 'findMany').mockResolvedValueOnce(items);
    jest.spyOn(prisma.service, 'count').mockResolvedValueOnce(1);

    const response = await prismaServiceRepository.getAll(params);

    expect(prisma.service.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
      where: {},
    });
    expect(response).toEqual(result);
  });

  it('should return a service by id', async () => {
    const params: GetServiceByIdRepository.Params = { id: faker.string.uuid() };
    const item = {
      id: params.id,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(prisma.service, 'findUnique').mockResolvedValueOnce(item);

    const response = await prismaServiceRepository.getById(params);

    expect(prisma.service.findUnique).toHaveBeenCalledWith({ where: { id: params.id } });
    expect(response).toEqual(item);
  });

  it('should throw an error if service to get by id is not found', async () => {
    const params: GetServiceByIdRepository.Params = { id: faker.string.uuid() };
    jest.spyOn(prisma.service, 'findUnique').mockResolvedValueOnce(null);

    const responsePromise = prismaServiceRepository.getById(params);

    await expect(responsePromise).rejects.toThrow('Not found error');
    expect(prisma.service.findUnique).toHaveBeenCalledWith({ where: { id: params.id } });
  });

  it('should update an existing service', async () => {
    const params: UpdateServiceRepository.Params = {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
    };
    const updatedItem = {
      id: params.id,
      name: params.name || 'Default Name',
      description: params.description || null,
      price: params.price || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(prisma.service, 'findUnique').mockResolvedValueOnce(updatedItem);
    jest.spyOn(prisma.service, 'update').mockResolvedValueOnce(updatedItem);

    const response = await prismaServiceRepository.update(params);

    expect(prisma.service.update).toHaveBeenCalledWith({
      where: { id: params.id },
      data: { ...updatedItem, ...params },
    });
    expect(response).toEqual(updatedItem);
  });

  it('should throw an error if service to update is not found', async () => {
    const params: UpdateServiceRepository.Params = {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
    };
    jest.spyOn(prisma.service, 'findUnique').mockResolvedValueOnce(null);

    const responsePromise = prismaServiceRepository.update(params);

    await expect(responsePromise).rejects.toThrow('Not found error');
    expect(prisma.service.findUnique).toHaveBeenCalledWith({ where: { id: params.id } });
  });

  it('should delete an existing service', async () => {
    const params: DeleteServiceRepository.Params = { id: faker.string.uuid() };
    const deletedItem = {
      id: params.id,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(prisma.service, 'findUnique').mockResolvedValueOnce(deletedItem);

    await prismaServiceRepository.delete(params);

    expect(prisma.service.delete).toHaveBeenCalledWith({ where: { id: params.id } });
  });

  it('should throw an error if service to delete is not found', async () => {
    const params: DeleteServiceRepository.Params = { id: faker.string.uuid() };
    jest.spyOn(prisma.service, 'findUnique').mockResolvedValueOnce(null);

    const responsePromise = prismaServiceRepository.delete(params);

    await expect(responsePromise).rejects.toThrow('Not found error');
    expect(prisma.service.delete).not.toHaveBeenCalled();
  });
});
