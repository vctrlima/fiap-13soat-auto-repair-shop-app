import { DeleteVehicleRepository } from '@/application/protocols/db';
import { DeleteVehicle } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbDeleteVehicle } from './db-delete-vehicle';

const deleteVehicleRepositoryMock = (): DeleteVehicleRepository => {
  return { delete: jest.fn() } as DeleteVehicleRepository;
};

describe('DbDeleteVehicle', () => {
  let deleteVehicleRepository: DeleteVehicleRepository;
  let dbDeleteVehicle: DbDeleteVehicle;

  beforeEach(() => {
    deleteVehicleRepository = deleteVehicleRepositoryMock();
    dbDeleteVehicle = new DbDeleteVehicle(deleteVehicleRepository);
  });

  it('should delete a vehicle', async () => {
    const params: DeleteVehicle.Params = {
      id: faker.string.uuid(),
    };
    jest.spyOn(deleteVehicleRepository, 'delete').mockResolvedValueOnce(undefined);

    const result = await dbDeleteVehicle.delete(params);

    expect(deleteVehicleRepository.delete).toHaveBeenCalledWith(params);
    expect(result).toBeUndefined();
  });
});
