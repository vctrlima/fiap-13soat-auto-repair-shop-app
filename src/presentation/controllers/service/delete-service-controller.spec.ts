import { DeleteService } from '@/domain/use-cases';
import { noContent } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { faker } from '@faker-js/faker';
import { DeleteServiceController } from './delete-service-controller';

const deleteServiceMock = (): DeleteService => ({
  delete: jest.fn(),
});

describe('DeleteServiceController', () => {
  let deleteService: DeleteService;
  let deleteServiceController: DeleteServiceController;

  beforeEach(() => {
    deleteService = deleteServiceMock();
    deleteServiceController = new DeleteServiceController(deleteService);
  });

  it('should delete service and return 200 OK', async () => {
    const request: HttpRequest<DeleteService.Params> = {
      params: { id: faker.string.uuid() },
    };
    jest.spyOn(deleteService, 'delete').mockResolvedValue();

    const response = await deleteServiceController.handle(request);

    expect(response).toEqual(noContent());
    expect(deleteService.delete).toHaveBeenCalledWith(request.params);
  });

  it('should return 500 ServerError if DeleteService throws', async () => {
    const request: HttpRequest<DeleteService.Params> = {
      params: { id: faker.string.uuid() },
    };
    jest.spyOn(deleteService, 'delete').mockRejectedValue(new Error());

    const response = await deleteServiceController.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
