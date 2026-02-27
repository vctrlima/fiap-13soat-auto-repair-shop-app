import { Service } from '@/domain/entities';
import { CreateService } from '@/domain/use-cases';
import { created } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { faker } from '@faker-js/faker';
import { CreateServiceController } from './create-service-controller';

const createServiceMock = (): CreateService => ({
  create: jest.fn(),
});

describe('CreateServiceController', () => {
  let createService: CreateService;
  let createServiceController: CreateServiceController;

  beforeEach(() => {
    createService = createServiceMock();
    createServiceController = new CreateServiceController(createService);
  });

  it('should create a new service and return 200 OK', async () => {
    const request: HttpRequest<CreateService.Params> = {
      body: {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price()),
      },
    };
    const service = {
      id: faker.string.uuid(),
      ...request.body,
      createdAt: new Date(),
      updatedAt: undefined,
    } as Service;

    jest.spyOn(createService, 'create').mockResolvedValue(service);

    const response = await createServiceController.handle(request);

    expect(response).toEqual(created(service));
    expect(createService.create).toHaveBeenCalledWith(request.body);
  });

  it('should return 500 ServerError if CreateService throws', async () => {
    const request: HttpRequest<CreateService.Params> = {
      body: {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price()),
      },
    };
    jest.spyOn(createService, 'create').mockRejectedValue(new Error());

    const response = await createServiceController.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
