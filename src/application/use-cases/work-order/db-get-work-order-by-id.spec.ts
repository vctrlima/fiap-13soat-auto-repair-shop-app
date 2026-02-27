import { GetWorkOrderByIdRepository } from '@/application/protocols/db';
import { Status } from '@/domain/enums';
import { GetWorkOrderById } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbGetWorkOrderById } from './db-get-work-order-by-id';

const getWorkOrderByIdRepositoryMock = (): GetWorkOrderByIdRepository => {
  return { getById: jest.fn() } as GetWorkOrderByIdRepository;
};

describe('DbGetWorkOrderById', () => {
  let getWorkOrderByIdRepository: GetWorkOrderByIdRepository;
  let dbGetWorkOrderById: DbGetWorkOrderById;

  beforeEach(() => {
    getWorkOrderByIdRepository = getWorkOrderByIdRepositoryMock();
    dbGetWorkOrderById = new DbGetWorkOrderById(getWorkOrderByIdRepository);
  });

  it('should return a work order by id', async () => {
    const params: GetWorkOrderById.Params = {
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

    const workOrder: GetWorkOrderById.Result = {
      id: params.id,
      customer,
      vehicle,
      services,
      partsAndSupplies,
      status: Status.InExecution,
      budget:
        services.reduce((total, service) => total + service.price, 0) +
        partsAndSupplies.reduce((total, part) => total + part.price, 0),
      createdAt: new Date(),
      updatedAt: undefined,
    };

    jest.spyOn(getWorkOrderByIdRepository, 'getById').mockResolvedValueOnce(workOrder);

    const result = await dbGetWorkOrderById.getById(params);

    expect(getWorkOrderByIdRepository.getById).toHaveBeenCalledWith(params);
    expect(result).toEqual(workOrder);
  });
});
