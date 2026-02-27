import { DeleteVehicle } from '@/domain/use-cases';
import { noContent } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { faker } from '@faker-js/faker';
import { DeleteVehicleController } from './delete-vehicle-controller';

const deleteVehicleMock = (): DeleteVehicle => ({
  delete: jest.fn(),
});

describe('DeleteVehicleController', () => {
  let deleteVehicle: DeleteVehicle;
  let deleteVehicleController: DeleteVehicleController;

  beforeEach(() => {
    deleteVehicle = deleteVehicleMock();
    deleteVehicleController = new DeleteVehicleController(deleteVehicle);
  });

  it('should delete vehicle and return 200 OK', async () => {
    const id = faker.string.uuid();
    const request: HttpRequest<DeleteVehicle.Params> = {
      params: { id },
    };

    jest.spyOn(deleteVehicle, 'delete').mockResolvedValue();

    const response = await deleteVehicleController.handle(request);

    expect(response).toEqual(noContent());
    expect(deleteVehicle.delete).toHaveBeenCalledWith({ id });
  });

  it('should return 500 ServerError if DeleteVehicle throws', async () => {
    const request: HttpRequest<DeleteVehicle.Params> = {
      params: { id: faker.string.uuid() },
    };
    jest.spyOn(deleteVehicle, 'delete').mockRejectedValue(new Error());

    const response = await deleteVehicleController.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
