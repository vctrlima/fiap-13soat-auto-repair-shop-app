import { GetAllWorkOrdersRepository } from '@/application/protocols/db';
import { Status } from '@/domain/enums';
import { GetAllWorkOrders } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbGetAllWorkOrders } from './db-get-all-work-orders';

const getAllWorkOrdersRepositoryMock = (): GetAllWorkOrdersRepository => {
  return { getAll: jest.fn() } as GetAllWorkOrdersRepository;
};

describe('DbGetAllWorkOrders', () => {
  let getAllWorkOrdersRepository: GetAllWorkOrdersRepository;
  let dbGetAllWorkOrders: DbGetAllWorkOrders;

  beforeEach(() => {
    getAllWorkOrdersRepository = getAllWorkOrdersRepositoryMock();
    dbGetAllWorkOrders = new DbGetAllWorkOrders(getAllWorkOrdersRepository);
  });

  it('should return all work orders with pagination', async () => {
    const params: GetAllWorkOrders.Params = {
      page: 1,
      limit: 10,
      status: Status.InExecution,
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

    const vehicle = {
      id: faker.string.uuid(),
      customer,
      licensePlate: faker.string.alphanumeric(7).toUpperCase(),
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.number.int({ min: 1990, max: 2024 }),
      createdAt: new Date(),
      updatedAt: undefined,
    };

    const services = Array(2)
      .fill(null)
      .map(() => ({
        id: faker.string.uuid(),
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price()),
        createdAt: new Date(),
        updatedAt: undefined,
      }));

    const partsAndSupplies = Array(1)
      .fill(null)
      .map(() => ({
        id: faker.string.uuid(),
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price()),
        inStock: faker.number.int({ min: 1, max: 100 }),
        createdAt: new Date(),
        updatedAt: undefined,
      }));

    const items = [
      {
        id: faker.string.uuid(),
        customer,
        vehicle,
        services,
        partsAndSupplies,
        status: params.status || Status.InExecution,
        budget:
          services.reduce((total, service) => total + service.price, 0) +
          partsAndSupplies.reduce((total, part) => total + part.price, 0),
        createdAt: new Date(),
        updatedAt: undefined,
      },
    ];

    const result: GetAllWorkOrders.Result = {
      content: items,
      total: 1,
      page: params.page,
      limit: params.limit,
      totalPages: 1,
    };

    jest.spyOn(getAllWorkOrdersRepository, 'getAll').mockResolvedValueOnce(result);

    const response = await dbGetAllWorkOrders.getAll(params);

    expect(getAllWorkOrdersRepository.getAll).toHaveBeenCalledWith(params);
    expect(response).toEqual(result);
  });
});
