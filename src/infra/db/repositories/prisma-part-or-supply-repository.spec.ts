import {
  CreatePartOrSupplyRepository,
  DeletePartOrSupplyRepository,
  GetAllPartsOrSuppliesRepository,
  GetPartOrSupplyByIdRepository,
  UpdatePartOrSupplyRepository,
} from '@/application/protocols/db';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { PrismaPartOrSupplyRepository } from './prisma-part-or-supply-repository';

type PartOrSupplyRepository = CreatePartOrSupplyRepository &
  GetAllPartsOrSuppliesRepository &
  GetPartOrSupplyByIdRepository &
  UpdatePartOrSupplyRepository &
  DeletePartOrSupplyRepository;

const prismaClientMock = (): PrismaClient =>
  ({
    partOrSupply: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  } as PrismaClient & { partOrSupply: any });

describe('PrismaPartOrSupplyRepository', () => {
  let prisma: PrismaClient;
  let prismaPartOrSupplyRepository: PartOrSupplyRepository;

  beforeEach(() => {
    prisma = prismaClientMock();
    prismaPartOrSupplyRepository = new PrismaPartOrSupplyRepository(prisma);
  });

  it('should be defined', () => {
    expect(prismaPartOrSupplyRepository).toBeTruthy();
  });

  it('should save a new part or supply on the database', async () => {
    const params: CreatePartOrSupplyRepository.Params = {
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      inStock: faker.number.int({ min: 1, max: 100 }),
    };
    const createdItem = {
      id: faker.string.uuid(),
      name: params.name,
      description: params.description || null,
      price: params.price,
      inStock: params.inStock,
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(prisma.partOrSupply, 'create').mockResolvedValue(createdItem);

    const response = await prismaPartOrSupplyRepository.create(params);

    expect(prisma.partOrSupply.create).toHaveBeenCalledWith({
      data: { ...params, description: params.description || null },
    });
    expect(response).toEqual(createdItem);
  });

  it('should save a new part or supply without description', async () => {
    const params: CreatePartOrSupplyRepository.Params = {
      name: faker.commerce.productName(),
      price: Number(faker.commerce.price()),
      inStock: faker.number.int({ min: 1, max: 100 }),
    };
    const createdItem = {
      id: faker.string.uuid(),
      name: params.name,
      description: null,
      price: params.price,
      inStock: params.inStock,
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(prisma.partOrSupply, 'create').mockResolvedValue(createdItem);

    const response = await prismaPartOrSupplyRepository.create(params);

    expect(prisma.partOrSupply.create).toHaveBeenCalledWith({
      data: { ...params, description: null },
    });
    expect(response).toEqual(createdItem);
  });

  it('should return all parts or supplies with pagination', async () => {
    const params: GetAllPartsOrSuppliesRepository.Params = {
      page: 1,
      limit: 10,
      name: faker.commerce.productName(),
    };
    const items = [
      {
        id: faker.string.uuid(),
        name: params.name as string,
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price()),
        inStock: faker.number.int({ min: 1, max: 100 }),
        createdAt: new Date(),
        updatedAt: null,
      },
    ];
    const result: GetAllPartsOrSuppliesRepository.Result = {
      content: items,
      total: 1,
      page: params.page,
      limit: params.limit,
      totalPages: 1,
    };
    jest.spyOn(prisma.partOrSupply, 'findMany').mockResolvedValueOnce(items);
    jest.spyOn(prisma.partOrSupply, 'count').mockResolvedValueOnce(1);

    const response = await prismaPartOrSupplyRepository.getAll(params);

    expect(prisma.partOrSupply.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
      where: { name: { contains: params.name, mode: 'insensitive' } },
    });
    expect(response).toEqual(result);
  });

  it('should return all parts or supplies without filters', async () => {
    const params: GetAllPartsOrSuppliesRepository.Params = {
      page: 1,
      limit: 10,
    };
    const items = [
      {
        id: faker.string.uuid(),
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price()),
        inStock: faker.number.int({ min: 1, max: 100 }),
        createdAt: new Date(),
        updatedAt: null,
      },
    ];
    const result: GetAllPartsOrSuppliesRepository.Result = {
      content: items,
      total: 1,
      page: params.page,
      limit: params.limit,
      totalPages: 1,
    };
    jest.spyOn(prisma.partOrSupply, 'findMany').mockResolvedValueOnce(items);
    jest.spyOn(prisma.partOrSupply, 'count').mockResolvedValueOnce(1);

    const response = await prismaPartOrSupplyRepository.getAll(params);

    expect(prisma.partOrSupply.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
      where: {},
    });
    expect(response).toEqual(result);
  });

  it('should return a part or supply by id', async () => {
    const params: GetPartOrSupplyByIdRepository.Params = { id: faker.string.uuid() };
    const item = {
      id: params.id,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      inStock: faker.number.int({ min: 1, max: 100 }),
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(prisma.partOrSupply, 'findUnique').mockResolvedValueOnce(item);

    const response = await prismaPartOrSupplyRepository.getById(params);

    expect(prisma.partOrSupply.findUnique).toHaveBeenCalledWith({ where: { id: params.id } });
    expect(response).toEqual(item);
  });

  it('should throw an error if part or supply to get by id is not found', async () => {
    const params: GetPartOrSupplyByIdRepository.Params = { id: faker.string.uuid() };
    jest.spyOn(prisma.partOrSupply, 'findUnique').mockResolvedValueOnce(null);

    const responsePromise = prismaPartOrSupplyRepository.getById(params);

    await expect(responsePromise).rejects.toThrow('Not found error');
    expect(prisma.partOrSupply.findUnique).toHaveBeenCalledWith({ where: { id: params.id } });
  });

  it('should update an existing part or supply', async () => {
    const params: UpdatePartOrSupplyRepository.Params = {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      inStock: faker.number.int({ min: 1, max: 100 }),
    };
    const updatedItem = {
      id: params.id,
      name: params.name || 'Default Name',
      description: params.description || null,
      price: params.price || 0,
      inStock: params.inStock || 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(prisma.partOrSupply, 'findUnique').mockResolvedValueOnce(updatedItem);
    jest.spyOn(prisma.partOrSupply, 'update').mockResolvedValueOnce(updatedItem);

    const response = await prismaPartOrSupplyRepository.update(params);

    expect(prisma.partOrSupply.update).toHaveBeenCalledWith({
      where: { id: params.id },
      data: { ...updatedItem, ...params },
    });
    expect(response).toEqual(updatedItem);
  });

  it('should throw an error if part or supply to update is not found', async () => {
    const params: UpdatePartOrSupplyRepository.Params = {
      id: faker.string.uuid(),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      inStock: faker.number.int({ min: 1, max: 100 }),
    };
    jest.spyOn(prisma.partOrSupply, 'findUnique').mockResolvedValueOnce(null);

    const responsePromise = prismaPartOrSupplyRepository.update(params);

    await expect(responsePromise).rejects.toThrow('Not found error');
    expect(prisma.partOrSupply.findUnique).toHaveBeenCalledWith({ where: { id: params.id } });
  });

  it('should delete an existing part or supply', async () => {
    const params: DeletePartOrSupplyRepository.Params = { id: faker.string.uuid() };
    const deletedItem = {
      id: params.id,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      inStock: faker.number.int({ min: 1, max: 100 }),
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(prisma.partOrSupply, 'findUnique').mockResolvedValueOnce(deletedItem);

    await prismaPartOrSupplyRepository.delete(params);

    expect(prisma.partOrSupply.delete).toHaveBeenCalledWith({ where: { id: params.id } });
  });

  it('should throw an error if part or supply to delete is not found', async () => {
    const params: DeletePartOrSupplyRepository.Params = { id: faker.string.uuid() };
    jest.spyOn(prisma.partOrSupply, 'findUnique').mockResolvedValueOnce(null);

    const responsePromise = prismaPartOrSupplyRepository.delete(params);

    await expect(responsePromise).rejects.toThrow('Not found error');
    expect(prisma.partOrSupply.delete).not.toHaveBeenCalled();
  });
});
