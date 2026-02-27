import { Status } from '@/domain/enums';
import { NotFoundError } from '@/presentation/errors';
import { notFound, ok, serverError } from '@/presentation/helpers';
import { faker } from '@faker-js/faker';
import { GetWorkOrderByIdController } from './get-work-order-by-id-controller';

const mockWorkOrder = {
  id: faker.string.uuid(),
  customerId: faker.string.uuid(),
  vehicleId: faker.string.uuid(),
  serviceIds: [faker.string.uuid(), faker.string.uuid()],
  status: Status.InExecution,
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
};

const mockGetWorkOrderById = {
  getById: jest.fn(),
};

const makeSut = () => {
  const sut = new GetWorkOrderByIdController(mockGetWorkOrderById);
  return { sut };
};

describe('GetWorkOrderByIdController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call GetWorkOrderById with correct id', async () => {
    const { sut } = makeSut();
    const id = faker.string.uuid();

    await sut.handle({ params: { id } });

    expect(mockGetWorkOrderById.getById).toHaveBeenCalledWith({ id });
  });

  it('should return 200 with work order on success', async () => {
    const { sut } = makeSut();
    mockGetWorkOrderById.getById.mockResolvedValueOnce(mockWorkOrder);

    const response = await sut.handle({ params: { id: 'any_id' } });

    expect(response).toEqual(ok(mockWorkOrder));
  });

  it('should return 404 if GetWorkOrderById throws NotFoundError', async () => {
    const { sut } = makeSut();
    const error = new NotFoundError('any_error');
    mockGetWorkOrderById.getById.mockRejectedValueOnce(error);

    const response = await sut.handle({ params: { id: 'any_id' } });

    expect(response).toEqual(notFound(error));
  });

  it('should return 500 if GetWorkOrderById throws', async () => {
    const { sut } = makeSut();
    const error = new Error('any_error');
    mockGetWorkOrderById.getById.mockRejectedValueOnce(error);

    const response = await sut.handle({ params: { id: 'any_id' } });

    expect(response).toEqual(serverError(error));
  });
});
