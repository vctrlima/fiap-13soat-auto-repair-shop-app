import { ServiceMetrics } from '@/domain/entities';
import { OrderDirection, Page } from '@/domain/types';
import { GetAllServiceMetrics } from '@/domain/use-cases';
import { ok, serverError } from '@/presentation/helpers';
import { faker } from '@faker-js/faker';
import { GetAllServiceMetricsController } from './get-all-service-metrics-controller';

const mockGetAllServiceMetrics = {
  getAll: jest.fn(),
} as jest.Mocked<GetAllServiceMetrics>;

const makeSut = () => {
  const sut = new GetAllServiceMetricsController(mockGetAllServiceMetrics);
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

const makePageResult = (): Page<ServiceMetrics> => {
  const content = Array.from({ length: faker.number.int({ min: 1, max: 10 }) }, makeServiceMetrics);
  return {
    page: faker.number.int({ min: 1, max: 5 }),
    limit: faker.number.int({ min: 10, max: 50 }),
    total: faker.number.int({ min: content.length, max: 100 }),
    totalPages: faker.number.int({ min: 1, max: 10 }),
    content,
  };
};

describe('GetAllServiceMetricsController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handle', () => {
    it('should return ok with service metrics when use case succeeds', async () => {
      const { sut } = makeSut();
      const params = {
        query: {
          page: faker.number.int({ min: 1, max: 5 }),
          limit: faker.number.int({ min: 10, max: 50 }),
          orderBy: faker.lorem.word(),
          orderDirection: OrderDirection.ASC,
          serviceId: faker.string.uuid(),
        },
      };
      const expectedResult = makePageResult();
      mockGetAllServiceMetrics.getAll.mockResolvedValueOnce(expectedResult);

      const result = await sut.handle(params);

      expect(mockGetAllServiceMetrics.getAll).toHaveBeenCalledWith(params.query);
      expect(result).toEqual(ok(expectedResult));
    });

    it('should return ok with service metrics when query has only required params', async () => {
      const { sut } = makeSut();
      const params = {
        query: {
          page: faker.number.int({ min: 1, max: 5 }),
          limit: faker.number.int({ min: 10, max: 50 }),
        },
      };
      const expectedResult = makePageResult();
      mockGetAllServiceMetrics.getAll.mockResolvedValueOnce(expectedResult);

      const result = await sut.handle(params);

      expect(mockGetAllServiceMetrics.getAll).toHaveBeenCalledWith(params.query);
      expect(result).toEqual(ok(expectedResult));
    });

    it('should return serverError when use case throws an error', async () => {
      const { sut } = makeSut();
      const params = {
        query: {
          page: faker.number.int({ min: 1, max: 5 }),
          limit: faker.number.int({ min: 10, max: 50 }),
        },
      };
      const error = new Error(faker.lorem.sentence());
      mockGetAllServiceMetrics.getAll.mockRejectedValueOnce(error);

      const result = await sut.handle(params);

      expect(mockGetAllServiceMetrics.getAll).toHaveBeenCalledWith(params.query);
      expect(result).toEqual(serverError(error));
    });
  });
});
