import { NotFoundError } from '@/presentation/errors';
import { noContent, notFound, serverError } from '@/presentation/helpers';
import { faker } from '@faker-js/faker';
import { DeleteWorkOrderController } from './delete-work-order-controller';

const mockDeleteWorkOrder = {
  delete: jest.fn(),
};

const makeSut = () => {
  const sut = new DeleteWorkOrderController(mockDeleteWorkOrder);
  return { sut };
};

describe('DeleteWorkOrderController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call DeleteWorkOrder with correct id', async () => {
    const { sut } = makeSut();
    const id = faker.string.uuid();

    await sut.handle({ params: { id } });

    expect(mockDeleteWorkOrder.delete).toHaveBeenCalledWith({ id });
  });

  it('should return 204 on success', async () => {
    const { sut } = makeSut();

    const response = await sut.handle({ params: { id: 'any_id' } });

    expect(response).toEqual(noContent());
  });

  it('should return 404 if DeleteWorkOrder throws NotFoundError', async () => {
    const { sut } = makeSut();
    const error = new NotFoundError('any_error');
    mockDeleteWorkOrder.delete.mockRejectedValueOnce(error);

    const response = await sut.handle({ params: { id: 'any_id' } });

    expect(response).toEqual(notFound(error));
  });

  it('should return 500 if DeleteWorkOrder throws', async () => {
    const { sut } = makeSut();
    const error = new Error('any_error');
    mockDeleteWorkOrder.delete.mockRejectedValueOnce(error);

    const response = await sut.handle({ params: { id: 'any_id' } });

    expect(response).toEqual(serverError(error));
  });
});
