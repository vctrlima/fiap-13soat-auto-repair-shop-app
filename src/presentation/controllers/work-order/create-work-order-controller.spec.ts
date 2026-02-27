import { Status } from '@/domain/enums';
import { MissingParamError } from '@/presentation/errors';
import { badRequest, created, serverError } from '@/presentation/helpers';
import { faker } from '@faker-js/faker';
import { CreateWorkOrderController } from './create-work-order-controller';

const mockWorkOrder = {
  id: faker.string.uuid(),
  customerId: faker.string.uuid(),
  vehicleId: faker.string.uuid(),
  serviceIds: [faker.string.uuid(), faker.string.uuid()],
  status: Status.InExecution,
  createdAt: faker.date.recent(),
  updatedAt: faker.date.recent(),
};

const mockCreateWorkOrder = {
  create: jest.fn(),
};

const makeSut = () => {
  const sut = new CreateWorkOrderController(mockCreateWorkOrder);
  return { sut };
};

describe('CreateWorkOrderController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 400 if no body is provided', async () => {
    const { sut } = makeSut();
    const response = await sut.handle({});
    expect(response).toEqual(badRequest(new MissingParamError('body')));
  });

  it('should return 400 if no customerId is provided', async () => {
    const { sut } = makeSut();

    const response = await sut.handle({
      body: {
        vehicleId: faker.string.uuid(),
        serviceIds: [faker.string.uuid()],
      } as any,
    });

    expect(response).toEqual(badRequest(new MissingParamError('customerId')));
  });

  it('should return 400 if no vehicleId is provided', async () => {
    const { sut } = makeSut();

    const response = await sut.handle({
      body: {
        customerId: faker.string.uuid(),
        serviceIds: [faker.string.uuid()],
      } as any,
    });

    expect(response).toEqual(badRequest(new MissingParamError('vehicleId')));
  });

  it('should call CreateWorkOrder with correct values', async () => {
    const { sut } = makeSut();
    const request = {
      body: {
        customerId: faker.string.uuid(),
        vehicleId: faker.string.uuid(),
        serviceIds: [faker.string.uuid()],
        partAndSupplyIds: [faker.string.uuid()],
        status: Status.InExecution,
      },
    };
    mockCreateWorkOrder.create.mockResolvedValueOnce(mockWorkOrder);

    await sut.handle(request);

    expect(mockCreateWorkOrder.create).toHaveBeenCalledWith(request.body);
  });

  it('should return 500 if CreateWorkOrder throws', async () => {
    const { sut } = makeSut();
    const error = new Error('any_error');
    mockCreateWorkOrder.create.mockRejectedValueOnce(error);

    const response = await sut.handle({
      body: {
        customerId: faker.string.uuid(),
        vehicleId: faker.string.uuid(),
        serviceIds: [faker.string.uuid()],
      },
    });

    expect(response).toEqual(serverError(error));
  });

  it('should return 200 with work order on success', async () => {
    const { sut } = makeSut();
    mockCreateWorkOrder.create.mockResolvedValueOnce(mockWorkOrder);

    const response = await sut.handle({
      body: {
        customerId: faker.string.uuid(),
        vehicleId: faker.string.uuid(),
        serviceIds: [faker.string.uuid()],
      },
    });

    expect(response).toEqual(created(mockWorkOrder));
  });
});
