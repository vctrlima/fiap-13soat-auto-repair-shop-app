import { GetAllVehiclesRepository } from '@/application/protocols/db';
import { Vehicle } from '@/domain/entities';
import { GetAllVehicles } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbGetAllVehicles } from './db-get-all-vehicles';

const getAllVehiclesRepositoryMock = (): GetAllVehiclesRepository => {
  return { getAll: jest.fn() } as GetAllVehiclesRepository;
};

describe('DbGetAllVehicles', () => {
  let getAllVehiclesRepository: GetAllVehiclesRepository;
  let dbGetAllVehicles: DbGetAllVehicles;

  beforeEach(() => {
    getAllVehiclesRepository = getAllVehiclesRepositoryMock();
    dbGetAllVehicles = new DbGetAllVehicles(getAllVehiclesRepository);
  });

  it('should return all vehicles with pagination', async () => {
    const params: GetAllVehicles.Params = {
      page: 1,
      limit: 10,
      licensePlate: faker.string.alphanumeric(7).toUpperCase(),
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
    const items: Vehicle[] = [
      {
        id: faker.string.uuid(),
        customer,
        licensePlate: params.licensePlate as string,
        brand: faker.vehicle.manufacturer(),
        model: faker.vehicle.model(),
        year: faker.number.int({ min: 1990, max: 2024 }),
        createdAt: new Date(),
        updatedAt: undefined,
      },
    ];
    const result: GetAllVehicles.Result = {
      content: items,
      total: 1,
      page: params.page,
      limit: params.limit,
      totalPages: 1,
    };
    jest.spyOn(getAllVehiclesRepository, 'getAll').mockResolvedValueOnce(result);

    const response = await dbGetAllVehicles.getAll(params);

    expect(getAllVehiclesRepository.getAll).toHaveBeenCalledWith(params);
    expect(response).toEqual(result);
  });
});
