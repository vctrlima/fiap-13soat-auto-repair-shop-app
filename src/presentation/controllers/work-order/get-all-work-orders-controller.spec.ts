import { Status } from '@/domain/enums';
import { ok, serverError } from '@/presentation/helpers';
import { faker } from '@faker-js/faker';
import { GetAllWorkOrdersController } from './get-all-work-orders-controller';

const mockWorkOrders = {
  items: [
    {
      id: faker.string.uuid(),
      customerId: faker.string.uuid(),
      vehicleId: faker.string.uuid(),
      serviceIds: [faker.string.uuid(), faker.string.uuid()],
      status: Status.InExecution,
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
    },
  ],
  total: faker.number.int({ min: 1, max: 100 }),
  page: faker.number.int({ min: 1, max: 10 }),
  pageSize: faker.number.int({ min: 10, max: 50 }),
  totalPages: faker.number.int({ min: 1, max: 10 }),
};

const mockGetAllWorkOrders = {
  getAll: jest.fn(),
};

const makeSut = () => {
  const sut = new GetAllWorkOrdersController(mockGetAllWorkOrders);
  return { sut };
};

describe('GetAllWorkOrdersController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call GetAllWorkOrders with correct values', async () => {
    const { sut } = makeSut();
    const query = {
      customerId: faker.string.uuid(),
      vehicleId: faker.string.uuid(),
      status: Status.InExecution,
      minBudget: faker.number.int({ min: 100, max: 1000 }),
      maxBudget: faker.number.int({ min: 1001, max: 5000 }),
      page: faker.number.int({ min: 1, max: 10 }),
      pageSize: faker.number.int({ min: 10, max: 50 }),
    };

    await sut.handle({ query });

    expect(mockGetAllWorkOrders.getAll).toHaveBeenCalledWith(query);
  });

  it('should return 200 with work orders on success', async () => {
    const { sut } = makeSut();
    mockGetAllWorkOrders.getAll.mockResolvedValueOnce(mockWorkOrders);

    const response = await sut.handle({ query: {} });

    expect(response).toEqual(ok(mockWorkOrders));
  });

  it('should return 500 if GetAllWorkOrders throws', async () => {
    const { sut } = makeSut();
    const error = new Error('any_error');
    mockGetAllWorkOrders.getAll.mockRejectedValueOnce(error);

    const response = await sut.handle({ query: {} });

    expect(response).toEqual(serverError(error));
  });
});
