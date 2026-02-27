import { CreateVehicleRepository } from '@/application/protocols/db';
import { CreateVehicle } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbCreateVehicle } from './db-create-vehicle';

const createVehicleRepositoryMock = (): CreateVehicleRepository => {
  return { create: jest.fn() } as CreateVehicleRepository;
};

describe('DbCreateVehicle', () => {
  let createVehicleRepository: CreateVehicleRepository;
  let dbCreateVehicle: DbCreateVehicle;

  beforeEach(() => {
    createVehicleRepository = createVehicleRepositoryMock();
    dbCreateVehicle = new DbCreateVehicle(createVehicleRepository);
  });

  it('should create a new vehicle', async () => {
    const params: CreateVehicle.Params = {
      customerId: faker.string.uuid(),
      licensePlate: faker.string.alphanumeric(7).toUpperCase(),
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.number.int({ min: 1990, max: 2024 }),
    };
    const customer = {
      id: params.customerId,
      document: faker.string.numeric(11),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      vehicles: [],
      createdAt: new Date(),
      updatedAt: null,
    };
    const createdVehicle: CreateVehicle.Result = {
      id: faker.string.uuid(),
      customer,
      licensePlate: params.licensePlate,
      brand: params.brand,
      model: params.model,
      year: params.year,
      createdAt: new Date(),
      updatedAt: undefined,
    };
    jest.spyOn(createVehicleRepository, 'create').mockResolvedValueOnce(createdVehicle);

    const result = await dbCreateVehicle.create(params);

    expect(createVehicleRepository.create).toHaveBeenCalledWith(params);
    expect(result).toEqual(createdVehicle);
  });
});
