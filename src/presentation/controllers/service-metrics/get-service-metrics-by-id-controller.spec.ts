import { ServiceMetrics } from '@/domain/entities';
import { GetServiceMetricsById } from '@/domain/use-cases';
import { NotFoundError } from '@/presentation/errors';
import { notFound, ok, serverError } from '@/presentation/helpers';
import { faker } from '@faker-js/faker';
import { GetServiceMetricsByIdController } from './get-service-metrics-by-id-controller';

const mockGetServiceMetricsById = {
  getById: jest.fn(),
} as jest.Mocked<GetServiceMetricsById>;

const makeSut = () => {
  const sut = new GetServiceMetricsByIdController(mockGetServiceMetricsById);
  return { sut };
};

const makeServiceMetrics = (): ServiceMetrics => ({
  service: {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    description: faker.lorem.sentence(),
    price: faker.number.int({ min: 30, max: 480 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  },
  averageExecutionTimeInMinutes: faker.number.int({ min: 20, max: 500 }),
});

describe('GetServiceMetricsByIdController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handle', () => {
    it('should return ok with service metrics when use case succeeds', async () => {
      const { sut } = makeSut();
      const serviceId = faker.string.uuid();
      const params = {
        params: { id: serviceId },
      };
      const expectedResult = makeServiceMetrics();
      mockGetServiceMetricsById.getById.mockResolvedValueOnce(expectedResult);

      const result = await sut.handle(params);

      expect(mockGetServiceMetricsById.getById).toHaveBeenCalledWith({ id: serviceId });
      expect(result).toEqual(ok(expectedResult));
    });

    it('should return notFound when use case throws NotFoundError', async () => {
      const { sut } = makeSut();
      const serviceId = faker.string.uuid();
      const params = {
        params: { id: serviceId },
      };
      const error = new NotFoundError(faker.lorem.sentence());
      mockGetServiceMetricsById.getById.mockRejectedValueOnce(error);

      const result = await sut.handle(params);

      expect(mockGetServiceMetricsById.getById).toHaveBeenCalledWith({ id: serviceId });
      expect(result).toEqual(notFound(error));
    });

    it('should return serverError when use case throws a generic error', async () => {
      const { sut } = makeSut();
      const serviceId = faker.string.uuid();
      const params = {
        params: { id: serviceId },
      };
      const error = new Error(faker.lorem.sentence());
      mockGetServiceMetricsById.getById.mockRejectedValueOnce(error);

      const result = await sut.handle(params);

      expect(mockGetServiceMetricsById.getById).toHaveBeenCalledWith({ id: serviceId });
      expect(result).toEqual(serverError(error));
    });
  });
});
