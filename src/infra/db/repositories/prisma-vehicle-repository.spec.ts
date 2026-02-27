import {
  CreateVehicleRepository,
  DeleteVehicleRepository,
  GetAllVehiclesRepository,
  GetVehicleByIdRepository,
  UpdateVehicleRepository,
} from '@/application/protocols/db';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
import { PrismaVehicleRepository } from './prisma-vehicle-repository';

type VehicleRepository = CreateVehicleRepository &
  GetAllVehiclesRepository &
  GetVehicleByIdRepository &
  UpdateVehicleRepository &
  DeleteVehicleRepository;

const prismaClientMock = (): PrismaClient =>
  ({
    vehicle: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  } as PrismaClient & { vehicle: any });

describe('PrismaVehicleRepository', () => {
  let prisma: PrismaClient;
  let prismaVehicleRepository: VehicleRepository;

  beforeEach(() => {
    prisma = prismaClientMock();
    prismaVehicleRepository = new PrismaVehicleRepository(prisma);
  });

  it('should be defined', () => {
    expect(prismaVehicleRepository).toBeTruthy();
  });

  it('should save a new vehicle on the database', async () => {
    const params: CreateVehicleRepository.Params = {
      customerId: faker.string.uuid(),
      licensePlate: faker.string.alphanumeric(7).toUpperCase(),
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.number.int({ min: 1980, max: 2024 }),
    };
    const customerData = {
      id: params.customerId,
      name: faker.person.fullName(),
      email: faker.internet.email(),
      document: faker.string.numeric(11),
      phone: faker.phone.number(),
      createdAt: new Date(),
      updatedAt: null,
      vehicles: [],
    };
    const createdVehicle = {
      id: faker.string.uuid(),
      customerId: params.customerId,
      customer: customerData,
      licensePlate: params.licensePlate,
      brand: params.brand,
      model: params.model,
      year: params.year,
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(prisma.vehicle, 'create').mockResolvedValue(createdVehicle);

    const response = await prismaVehicleRepository.create(params);

    expect(prisma.vehicle.create).toHaveBeenCalledWith({
      data: params,
      include: { customer: true },
    });
    expect(response).toEqual({
      id: createdVehicle.id,
      customer: customerData,
      licensePlate: createdVehicle.licensePlate,
      brand: createdVehicle.brand,
      model: createdVehicle.model,
      year: createdVehicle.year,
      createdAt: createdVehicle.createdAt,
      updatedAt: createdVehicle.updatedAt,
    });
  });

  it('should return all vehicles with pagination', async () => {
    const params: GetAllVehiclesRepository.Params = {
      page: 1,
      limit: 10,
      licensePlate: faker.string.alphanumeric(7).toUpperCase(),
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.number.int({ min: 1980, max: 2024 }),
    };
    const customerData = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      document: faker.string.numeric(11),
      phone: faker.phone.number(),
      createdAt: new Date(),
      updatedAt: null,
      vehicles: [],
    };
    const items = [
      {
        id: faker.string.uuid(),
        customerId: customerData.id,
        customer: customerData,
        licensePlate: params.licensePlate as string,
        brand: params.brand as string,
        model: params.model as string,
        year: params.year as number,
        createdAt: new Date(),
        updatedAt: null,
      },
    ];
    const result: GetAllVehiclesRepository.Result = {
      content: items.map((item) => ({
        id: item.id,
        customer: item.customer,
        licensePlate: item.licensePlate,
        brand: item.brand,
        model: item.model,
        year: item.year,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      total: 1,
      page: params.page,
      limit: params.limit,
      totalPages: 1,
    };
    jest.spyOn(prisma.vehicle, 'findMany').mockResolvedValueOnce(items);
    jest.spyOn(prisma.vehicle, 'count').mockResolvedValueOnce(1);

    const response = await prismaVehicleRepository.getAll(params);

    expect(prisma.vehicle.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { customer: true },
      where: {
        licensePlate: { contains: params.licensePlate },
        brand: { contains: params.brand, mode: 'insensitive' },
        model: { contains: params.model, mode: 'insensitive' },
        year: params.year,
      },
    });
    expect(response).toEqual(result);
  });

  it('should return all vehicles without filters', async () => {
    const params: GetAllVehiclesRepository.Params = {
      page: 1,
      limit: 10,
    };
    const customerData = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      document: faker.string.numeric(11),
      phone: faker.phone.number(),
      createdAt: new Date(),
      updatedAt: null,
      vehicles: [],
    };
    const items = [
      {
        id: faker.string.uuid(),
        customerId: customerData.id,
        customer: customerData,
        licensePlate: faker.string.alphanumeric(7).toUpperCase(),
        brand: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        year: faker.number.int({ min: 1980, max: 2024 }),
        createdAt: new Date(),
        updatedAt: null,
      },
    ];
    const result: GetAllVehiclesRepository.Result = {
      content: items.map((item) => ({
        id: item.id,
        customer: item.customer,
        licensePlate: item.licensePlate,
        brand: item.brand,
        model: item.model,
        year: item.year,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
      total: 1,
      page: params.page,
      limit: params.limit,
      totalPages: 1,
    };
    jest.spyOn(prisma.vehicle, 'findMany').mockResolvedValueOnce(items);
    jest.spyOn(prisma.vehicle, 'count').mockResolvedValueOnce(1);

    const response = await prismaVehicleRepository.getAll(params);

    expect(prisma.vehicle.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { customer: true },
      where: {},
    });
    expect(response).toEqual(result);
  });

  it('should return a vehicle by id', async () => {
    const params: GetVehicleByIdRepository.Params = { id: faker.string.uuid() };
    const customerData = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      document: faker.string.numeric(11),
      phone: faker.phone.number(),
      createdAt: new Date(),
      updatedAt: null,
      vehicles: [],
    };
    const item = {
      id: params.id,
      customerId: customerData.id,
      customer: customerData,
      licensePlate: faker.string.alphanumeric(7).toUpperCase(),
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.number.int({ min: 1980, max: 2024 }),
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(prisma.vehicle, 'findUnique').mockResolvedValueOnce(item);

    const response = await prismaVehicleRepository.getById(params);

    expect(prisma.vehicle.findUnique).toHaveBeenCalledWith({
      where: { id: params.id },
      include: { customer: true },
    });
    expect(response).toEqual({
      id: item.id,
      customer: item.customer,
      licensePlate: item.licensePlate,
      brand: item.brand,
      model: item.model,
      year: item.year,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    });
  });

  it('should throw an error if vehicle to get by id is not found', async () => {
    const params: GetVehicleByIdRepository.Params = { id: faker.string.uuid() };
    jest.spyOn(prisma.vehicle, 'findUnique').mockResolvedValueOnce(null);

    const responsePromise = prismaVehicleRepository.getById(params);

    await expect(responsePromise).rejects.toThrow('Not found error');
    expect(prisma.vehicle.findUnique).toHaveBeenCalledWith({
      where: { id: params.id },
      include: { customer: true },
    });
  });

  it('should update an existing vehicle', async () => {
    const params: UpdateVehicleRepository.Params = {
      id: faker.string.uuid(),
      brand: faker.vehicle.manufacturer() as string,
      model: faker.vehicle.model() as string,
      year: faker.number.int({ min: 1980, max: 2024 }) as number,
    };
    const customerData = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      document: faker.string.numeric(11),
      phone: faker.phone.number(),
      createdAt: new Date(),
      updatedAt: null,
      vehicles: [],
    };
    const updatedVehicle = {
      id: params.id,
      customerId: customerData.id,
      customer: customerData,
      licensePlate: faker.string.alphanumeric(7).toUpperCase() as string,
      brand: params.brand as string,
      model: params.model as string,
      year: params.year as number,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(prisma.vehicle, 'findUnique').mockResolvedValueOnce(updatedVehicle);
    jest.spyOn(prisma.vehicle, 'update').mockResolvedValueOnce(updatedVehicle);

    const response = await prismaVehicleRepository.update(params);

    expect(prisma.vehicle.update).toHaveBeenCalledWith({
      where: { id: params.id },
      data: {
        brand: params.brand,
        model: params.model,
        year: params.year,
      },
      include: { customer: true },
    });
    expect(response).toEqual({
      id: updatedVehicle.id,
      customer: updatedVehicle.customer,
      licensePlate: updatedVehicle.licensePlate,
      brand: updatedVehicle.brand,
      model: updatedVehicle.model,
      year: updatedVehicle.year,
      createdAt: updatedVehicle.createdAt,
      updatedAt: updatedVehicle.updatedAt,
    });
  });

  it('should throw an error if vehicle to update is not found', async () => {
    const params: UpdateVehicleRepository.Params = {
      id: faker.string.uuid(),
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.number.int({ min: 1980, max: 2024 }),
    };
    jest.spyOn(prisma.vehicle, 'findUnique').mockResolvedValueOnce(null);

    const responsePromise = prismaVehicleRepository.update(params);

    await expect(responsePromise).rejects.toThrow('Not found error');
    expect(prisma.vehicle.findUnique).toHaveBeenCalledWith({
      where: { id: params.id },
      include: { customer: true },
    });
  });

  it('should delete an existing vehicle', async () => {
    const params: DeleteVehicleRepository.Params = { id: faker.string.uuid() };
    const customerData = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      document: faker.string.numeric(11),
      phone: faker.phone.number(),
      createdAt: new Date(),
      updatedAt: null,
      vehicles: [],
    };
    const deletedVehicle = {
      id: params.id,
      customerId: customerData.id,
      customer: customerData,
      licensePlate: faker.string.alphanumeric(7).toUpperCase(),
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.number.int({ min: 1980, max: 2024 }),
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(prisma.vehicle, 'findUnique').mockResolvedValueOnce(deletedVehicle);

    await prismaVehicleRepository.delete(params);

    expect(prisma.vehicle.delete).toHaveBeenCalledWith({ where: { id: params.id } });
  });

  it('should throw an error if vehicle to delete is not found', async () => {
    const params: DeleteVehicleRepository.Params = { id: faker.string.uuid() };
    jest.spyOn(prisma.vehicle, 'findUnique').mockResolvedValueOnce(null);

    const responsePromise = prismaVehicleRepository.delete(params);

    await expect(responsePromise).rejects.toThrow('Not found error');
    expect(prisma.vehicle.findUnique).toHaveBeenCalledWith({
      where: { id: params.id },
      include: { customer: true },
    });
    expect(prisma.vehicle.delete).not.toHaveBeenCalled();
  });
});
