import { Status } from '@/domain/enums';
import { MissingParamError, NotFoundError } from '@/presentation/errors';
import { badRequest, notFound, ok, serverError } from '@/presentation/helpers';
import { faker } from '@faker-js/faker';
import { UpdateWorkOrderController } from './update-work-order-controller';

const mockWorkOrder = {
  id: faker.string.uuid(),
  customerId: faker.string.uuid(),
  vehicleId: faker.string.uuid(),
  serviceIds: [faker.string.uuid(), faker.string.uuid()],
  status: Status.InExecution,
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
};

const mockUpdateWorkOrder = {
  update: jest.fn(),
};

const makeSut = () => {
  const sut = new UpdateWorkOrderController(mockUpdateWorkOrder);
  return { sut };
};

describe('UpdateWorkOrderController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if no id is provided', async () => {
    const { sut } = makeSut();
    const response = await sut.handle({ body: {} as any });

    expect(response).toEqual(badRequest(new MissingParamError('id')));
  });

  it('should return 400 if no body is provided', async () => {
    const { sut } = makeSut();
    const response = await sut.handle({ params: { id: 'any_id' } });

    expect(response).toEqual(badRequest(new MissingParamError('body')));
  });

  it('should call UpdateWorkOrder with correct values', async () => {
    const { sut } = makeSut();
    const id = faker.string.uuid();
    const request = {
      params: { id },
      body: {
        id,
        serviceIds: [faker.string.uuid(), faker.string.uuid()],
        partAndSupplyIds: [faker.string.uuid(), faker.string.uuid()],
        status: Status.InExecution,
      },
    };
    mockUpdateWorkOrder.update.mockResolvedValueOnce(mockWorkOrder);

    await sut.handle(request);

    expect(mockUpdateWorkOrder.update).toHaveBeenCalledWith({
      ...request.body,
      id: request.params.id,
    });
  });

  it('should return 404 if UpdateWorkOrder throws NotFoundError', async () => {
    const { sut } = makeSut();
    const id = faker.string.uuid();
    const error = new NotFoundError('any_error');
    mockUpdateWorkOrder.update.mockRejectedValueOnce(error);

    const response = await sut.handle({
      params: { id },
      body: { id, status: Status.InExecution },
    });

    expect(response).toEqual(notFound(error));
  });

  it('should return 500 if UpdateWorkOrder throws', async () => {
    const { sut } = makeSut();
    const id = faker.string.uuid();
    const error = new Error('any_error');
    mockUpdateWorkOrder.update.mockRejectedValueOnce(error);

    const response = await sut.handle({
      params: { id },
      body: { id, status: Status.InExecution },
    });

    expect(response).toEqual(serverError(error));
  });

  it('should return 200 with updated work order on success', async () => {
    const { sut } = makeSut();
    const id = faker.string.uuid();
    mockUpdateWorkOrder.update.mockResolvedValueOnce(mockWorkOrder);

    const response = await sut.handle({
      params: { id },
      body: { id, status: Status.InExecution },
    });

    expect(response).toEqual(ok(mockWorkOrder));
  });
});
