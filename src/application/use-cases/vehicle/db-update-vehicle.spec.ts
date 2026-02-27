import { UpdateVehicleRepository } from '@/application/protocols/db';
import { UpdateVehicle } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbUpdateVehicle } from './db-update-vehicle';

const updateVehicleRepositoryMock = (): UpdateVehicleRepository => {
  return { update: jest.fn() } as UpdateVehicleRepository;
};

describe('DbUpdateVehicle', () => {
  let updateVehicleRepository: UpdateVehicleRepository;
  let dbUpdateVehicle: DbUpdateVehicle;

  beforeEach(() => {
    updateVehicleRepository = updateVehicleRepositoryMock();
    dbUpdateVehicle = new DbUpdateVehicle(updateVehicleRepository);
  });

  it('should update a vehicle', async () => {
    const params: UpdateVehicle.Params = {
      id: faker.string.uuid(),
      licensePlate: faker.string.alphanumeric(7).toUpperCase(),
      brand: faker.vehicle.manufacturer(),
      model: faker.vehicle.model(),
      year: faker.number.int({ min: 1990, max: 2024 }),
      customerId: faker.string.uuid(),
    };
    const customer = {
      id: params.customerId || faker.string.uuid(),
      document: faker.string.numeric(11),
      email: faker.internet.email(),
      name: faker.person.fullName(),
      phone: faker.phone.number(),
      vehicles: [],
      createdAt: new Date(),
      updatedAt: null,
    };
    const updatedVehicle: UpdateVehicle.Result = {
      id: params.id,
      customer,
      licensePlate: params.licensePlate || 'ABC1234',
      brand: params.brand || 'Any Brand',
      model: params.model || 'Any Model',
      year: params.year || 2000,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(updateVehicleRepository, 'update').mockResolvedValueOnce(updatedVehicle);

    const result = await dbUpdateVehicle.update(params);

    expect(updateVehicleRepository.update).toHaveBeenCalledWith(params);
    expect(result).toEqual(updatedVehicle);
  });
});
