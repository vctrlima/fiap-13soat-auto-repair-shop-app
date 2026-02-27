import { Service } from '@/domain/entities';
import { GetAllServices } from '@/domain/use-cases';
import { ok } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { faker } from '@faker-js/faker';
import { GetAllServicesController } from './get-all-services-controller';

const getAllServicesMock = (): GetAllServices => ({
  getAll: jest.fn(),
});

describe('GetAllServicesController', () => {
  let getAllServices: GetAllServices;
  let getAllServicesController: GetAllServicesController;

  beforeEach(() => {
    getAllServices = getAllServicesMock();
    getAllServicesController = new GetAllServicesController(getAllServices);
  });

  it('should get all services and return 200 OK', async () => {
    const request: HttpRequest<GetAllServices.Params> = {
      query: {
        page: 1,
        limit: 10,
        name: faker.commerce.productName(),
      },
    };
    const services: Service[] = [
      {
        id: faker.string.uuid(),
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price()),
        createdAt: new Date(),
        updatedAt: undefined,
      },
    ];
    const result: GetAllServices.Result = {
      content: services,
      total: services.length,
      page: request.query.page,
      limit: request.query.limit,
      totalPages: 1,
    };
    jest.spyOn(getAllServices, 'getAll').mockResolvedValue(result);

    const response = await getAllServicesController.handle(request);

    expect(response).toEqual(ok(result));
    expect(getAllServices.getAll).toHaveBeenCalledWith(request.query);
  });

  it('should return 500 ServerError if GetAllServices throws', async () => {
    const request: HttpRequest<GetAllServices.Params> = {
      query: {
        page: 1,
        limit: 10,
      },
    };

    jest.spyOn(getAllServices, 'getAll').mockRejectedValue(new Error());

    const response = await getAllServicesController.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
