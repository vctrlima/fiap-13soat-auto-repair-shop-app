import { Status } from '@/domain/enums';
import { MissingParamError, NotFoundError } from '@/presentation/errors';
import { badRequest, notFound, ok, serverError } from '@/presentation/helpers';
import { faker } from '@faker-js/faker';
import { CancelWorkOrderController } from './cancel-work-order-controller';

const mockWorkOrder = {
  workOrder: {
    id: faker.string.uuid(),
    status: Status.Canceled,
    customerName: faker.person.fullName(),
    vehicles: [faker.vehicle.model()],
    description: faker.lorem.sentence(),
    createdAt: faker.date.recent(),
    updatedAt: faker.date.recent(),
  },
};

const mockCancelWorkOrder = {
  cancel: jest.fn(),
};

const makeSut = () => {
  const sut = new CancelWorkOrderController(mockCancelWorkOrder);
  return { sut };
};

describe('CancelWorkOrderController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if no id is provided', async () => {
    const { sut } = makeSut();
    const response = await sut.handle({ body: {} as any });

    expect(response).toEqual(badRequest(new MissingParamError('id')));
  });

  it('should call CancelWorkOrder with correct values', async () => {
    const { sut } = makeSut();
    const id = faker.string.uuid();
    const request = {
      params: { id },
    };
    mockCancelWorkOrder.cancel.mockResolvedValueOnce(mockWorkOrder);

    await sut.handle(request);

    expect(mockCancelWorkOrder.cancel).toHaveBeenCalledWith({ id });
  });

  it('should return 200 with work order data on success', async () => {
    const { sut } = makeSut();
    const id = faker.string.uuid();
    mockCancelWorkOrder.cancel.mockResolvedValueOnce(mockWorkOrder);

    const response = await sut.handle({
      params: { id },
    });

    expect(response).toEqual(ok(mockWorkOrder));
  });

  it('should return 404 if CancelWorkOrder throws NotFoundError', async () => {
    const { sut } = makeSut();
    const id = faker.string.uuid();
    const error = new NotFoundError('Work order not found');
    mockCancelWorkOrder.cancel.mockRejectedValueOnce(error);

    const response = await sut.handle({
      params: { id },
    });

    expect(response).toEqual(notFound(error));
  });

  it('should return 500 if CancelWorkOrder throws generic error', async () => {
    const { sut } = makeSut();
    const id = faker.string.uuid();
    const error = new Error('Generic error');
    mockCancelWorkOrder.cancel.mockRejectedValueOnce(error);

    const response = await sut.handle({
      params: { id },
    });

    expect(response).toEqual(serverError(error));
  });
});
