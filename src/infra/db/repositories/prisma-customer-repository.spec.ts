import {
  CreateCustomerRepository,
  DeleteCustomerRepository,
  GetAllCustomersRepository,
  GetCustomerByDocumentRepository,
  UpdateCustomerRepository,
} from '@/application/protocols/db';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { PrismaCustomerRepository } from './prisma-customer-repository';

type CustomerRepository = CreateCustomerRepository &
  GetAllCustomersRepository &
  GetCustomerByDocumentRepository &
  UpdateCustomerRepository &
  DeleteCustomerRepository;

const prismaClientMock = (): PrismaClient =>
  ({
    customer: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  } as PrismaClient & { customer: any });

describe('PrismaCustomerRepository', () => {
  let prisma: PrismaClient;
  let prismaCustomerRepository: CustomerRepository;

  beforeEach(() => {
    prisma = prismaClientMock();
    prismaCustomerRepository = new PrismaCustomerRepository(prisma);
  });

  it('should be defined', () => {
    expect(prismaCustomerRepository).toBeTruthy();
  });

  it('should save a new customer on the database', async () => {
    const params: CreateCustomerRepository.Params = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      document: faker.string.numeric(11),
      phone: faker.phone.number(),
    };
    const createdCustomer = {
      id: faker.string.uuid(),
      document: params.document,
      name: params.name,
      email: params.email,
      phone: params.phone || null,
      vehicles: [],
      createdAt: new Date(),
      updatedAt: null,
    };
    const expectedCustomer = {
      id: createdCustomer.id,
      document: createdCustomer.document,
      name: createdCustomer.name,
      email: createdCustomer.email,
      phone: createdCustomer.phone,
      vehicles: [],
      createdAt: createdCustomer.createdAt,
      updatedAt: createdCustomer.updatedAt,
    };
    jest.spyOn(prisma.customer, 'create').mockResolvedValue(createdCustomer);

    const response = await prismaCustomerRepository.create(params);

    expect(prisma.customer.create).toHaveBeenCalledWith({ data: params, include: { vehicles: true } });
    expect(response).toEqual(expectedCustomer);
  });

  it('should not save a new customer with an existing document', async () => {
    const params: CreateCustomerRepository.Params = {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      document: '12345678900',
      phone: faker.phone.number(),
    };
    jest
      .spyOn(prisma.customer, 'create')
      .mockRejectedValue(new Error('Unique constraint failed on the fields: (`document`)'));

    const responsePromise = prismaCustomerRepository.create(params);

    await expect(responsePromise).rejects.toThrow('Unique constraint failed on the fields: (`document`)');
    expect(prisma.customer.create).toHaveBeenCalledWith({ data: params, include: { vehicles: true } });
  });

  it('should return all customers with pagination', async () => {
    const params: GetAllCustomersRepository.Params = {
      page: 1,
      limit: 10,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      document: faker.string.numeric(11),
    };
    const items = [
      {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        document: faker.string.numeric(11),
        phone: faker.phone.number(),
        vehicles: [],
        createdAt: new Date(),
        updatedAt: null,
      },
    ];
    const result: GetAllCustomersRepository.Result = {
      content: items,
      total: 1,
      page: params.page,
      limit: params.limit,
      totalPages: 1,
    };
    jest.spyOn(prisma.customer, 'findMany').mockResolvedValueOnce(items);
    jest.spyOn(prisma.customer, 'count').mockResolvedValueOnce(1);

    const response = await prismaCustomerRepository.getAll(params);

    expect(prisma.customer.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { vehicles: true },
      where: {
        name: { contains: params.name, mode: 'insensitive' },
        email: { contains: params.email, mode: 'insensitive' },
        document: { contains: params.document },
      },
    });
    expect(response).toEqual(result);
  });

  it('should return all customers without filters', async () => {
    const params: GetAllCustomersRepository.Params = {
      page: 1,
      limit: 10,
    };
    const items = [
      {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        document: faker.string.numeric(11),
        phone: faker.phone.number(),
        vehicles: [],
        createdAt: new Date(),
        updatedAt: null,
      },
    ];
    const result: GetAllCustomersRepository.Result = {
      content: items,
      total: 1,
      page: params.page,
      limit: params.limit,
      totalPages: 1,
    };
    jest.spyOn(prisma.customer, 'findMany').mockResolvedValueOnce(items);
    jest.spyOn(prisma.customer, 'count').mockResolvedValueOnce(1);

    const response = await prismaCustomerRepository.getAll(params);

    expect(prisma.customer.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { vehicles: true },
      where: {},
    });
    expect(response).toEqual(result);
  });

  it('should return a customer by document', async () => {
    const params: GetCustomerByDocumentRepository.Params = { document: faker.string.numeric(11) };
    const customer = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      document: params.document,
      phone: faker.phone.number(),
      vehicles: [],
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(prisma.customer, 'findUnique').mockResolvedValueOnce(customer);

    const response = await prismaCustomerRepository.getByDocument(params);

    expect(prisma.customer.findUnique).toHaveBeenCalledWith({
      where: { document: params.document },
      include: { vehicles: true },
    });
    expect(response).toEqual(customer);
  });

  it('should throw an error if customer to get by document is not found', async () => {
    const params: GetCustomerByDocumentRepository.Params = { document: faker.string.numeric(11) };
    jest.spyOn(prisma.customer, 'findUnique').mockResolvedValueOnce(null);

    const responsePromise = prismaCustomerRepository.getByDocument(params);

    await expect(responsePromise).rejects.toThrow('Not found error');
    expect(prisma.customer.findUnique).toHaveBeenCalledWith({
      where: { document: params.document },
      include: { vehicles: true },
    });
  });

  it('should update an existing customer', async () => {
    const params: UpdateCustomerRepository.Params = {
      document: faker.string.numeric(11),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
    };
    const updatedCustomer = {
      id: faker.string.uuid(),
      name: params.name || 'John Doe',
      email: params.email || 'john@example.com',
      document: params.document || '00000000000',
      phone: params.phone || null,
      vehicles: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(prisma.customer, 'findUnique').mockResolvedValueOnce(updatedCustomer);
    jest.spyOn(prisma.customer, 'update').mockResolvedValueOnce(updatedCustomer);

    const response = await prismaCustomerRepository.update(params);

    expect(prisma.customer.update).toHaveBeenCalledWith({
      where: { id: updatedCustomer.id },
      data: { ...params, id: updatedCustomer.id },
      include: { vehicles: true },
    });
    expect(response).toEqual(updatedCustomer);
  });

  it('should throw an error if customer to update is not found', async () => {
    const params: UpdateCustomerRepository.Params = {
      document: faker.string.numeric(11),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
    };
    jest.spyOn(prisma.customer, 'findUnique').mockResolvedValueOnce(null);

    const responsePromise = prismaCustomerRepository.update(params);

    await expect(responsePromise).rejects.toThrow('Not found error');
    expect(prisma.customer.findUnique).toHaveBeenCalledWith({
      where: { document: params.document },
      include: { vehicles: true },
    });
  });

  it('should delete an existing customer', async () => {
    const params: DeleteCustomerRepository.Params = { document: faker.string.numeric(11) };
    const deletedCustomer = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      document: params.document,
      phone: faker.phone.number(),
      vehicles: [],
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(prisma.customer, 'findUnique').mockResolvedValueOnce(deletedCustomer);

    await prismaCustomerRepository.delete(params);

    expect(prisma.customer.delete).toHaveBeenCalledWith({ where: { id: deletedCustomer.id } });
  });

  it('should throw an error if customer to delete is not found', async () => {
    const params: DeleteCustomerRepository.Params = { document: faker.string.uuid() };
    jest.spyOn(prisma.customer, 'findUnique').mockResolvedValueOnce(null);

    const responsePromise = prismaCustomerRepository.delete(params);

    await expect(responsePromise).rejects.toThrow('Not found error');
    expect(prisma.customer.delete).not.toHaveBeenCalled();
  });
});
