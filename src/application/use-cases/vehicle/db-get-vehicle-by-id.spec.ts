import { GetVehicleByIdRepository } from '@/application/protocols/db';
import { GetVehicleById } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbGetVehicleById } from './db-get-vehicle-by-id';

const getVehicleByIdRepositoryMock = (): GetVehicleByIdRepository => {
  return { getById: jest.fn() } as GetVehicleByIdRepository;
};

describe('DbGetVehicleById', () => {
  let getVehicleByIdRepository: GetVehicleByIdRepository;
  let dbGetVehicleById: DbGetVehicleById;

  beforeEach(() => {
    getVehicleByIdRepository = getVehicleByIdRepositoryMock();
    dbGetVehicleById = new DbGetVehicleById(getVehicleByIdRepository);
  });

  it('should return a vehicle by id', async () => {
    const params: GetVehicleById.Params = {
      id: faker.string.uuid(),
    };
    const customer = {
      id: faker.string.uuid(),
      document: faker.string.numeric(11),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      vehicles: [],
      createdAt: new Date(),
      updatedAt: null,
    };
    const vehicle: GetVehicleById.Result = {
      id: params.id,
      customer,
      licensePlate: faker.string.alphanumeric(7).toUpperCase(),
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.number.int({ min: 1990, max: 2024 }),
      createdAt: new Date(),
      updatedAt: undefined,
    };
    jest.spyOn(getVehicleByIdRepository, 'getById').mockResolvedValueOnce(vehicle);

    const result = await dbGetVehicleById.getById(params);

    expect(getVehicleByIdRepository.getById).toHaveBeenCalledWith(params);
    expect(result).toEqual(vehicle);
  });
});
