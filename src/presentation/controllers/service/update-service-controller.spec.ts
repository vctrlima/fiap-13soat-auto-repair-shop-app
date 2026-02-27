import { Service } from '@/domain/entities';
import { UpdateService } from '@/domain/use-cases';
import { ok } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { faker } from '@faker-js/faker';
import { UpdateServiceController } from './update-service-controller';

const updateServiceMock = (): UpdateService => ({
  update: jest.fn(),
});

describe('UpdateServiceController', () => {
  let updateService: UpdateService;
  let updateServiceController: UpdateServiceController;

  beforeEach(() => {
    updateService = updateServiceMock();
    updateServiceController = new UpdateServiceController(updateService);
  });

  it('should update service and return 200 OK', async () => {
    const id = faker.string.uuid();
    const request: HttpRequest<Omit<UpdateService.Params, 'id'>> = {
      params: { id },
      body: {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price()),
      },
    };

    const service: Service = {
      id,
      name: request.body?.name as string,
      description: request.body?.description as string,
      price: request.body?.price as number,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    jest.spyOn(updateService, 'update').mockResolvedValue(service);

    const response = await updateServiceController.handle(request);

    expect(response).toEqual(ok(service));
    expect(updateService.update).toHaveBeenCalledWith({
      id,
      ...request.body,
    });
  });

  it('should return 500 ServerError if UpdateService throws', async () => {
    const request: HttpRequest<Omit<UpdateService.Params, 'id'>> = {
      params: { id: faker.string.uuid() },
      body: {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price()),
      },
    };

    jest.spyOn(updateService, 'update').mockRejectedValue(new Error());

    const response = await updateServiceController.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
