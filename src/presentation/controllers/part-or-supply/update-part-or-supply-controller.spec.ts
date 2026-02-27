import { PartOrSupply } from '@/domain/entities';
import { UpdatePartOrSupply } from '@/domain/use-cases';
import { ok } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { faker } from '@faker-js/faker';
import { UpdatePartOrSupplyController } from './update-part-or-supply-controller';

const updatePartOrSupplyMock = (): UpdatePartOrSupply => ({
  update: jest.fn(),
});

describe('UpdatePartOrSupplyController', () => {
  let updatePartOrSupply: UpdatePartOrSupply;
  let updatePartOrSupplyController: UpdatePartOrSupplyController;

  beforeEach(() => {
    updatePartOrSupply = updatePartOrSupplyMock();
    updatePartOrSupplyController = new UpdatePartOrSupplyController(updatePartOrSupply);
  });

  it('should update part or supply and return 200 OK', async () => {
    const id = faker.string.uuid();
    const request: HttpRequest<Omit<UpdatePartOrSupply.Params, 'id'>> = {
      params: { id },
      body: {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price()),
        inStock: faker.number.int({ min: 1, max: 100 }),
      },
    };
    const partOrSupply: PartOrSupply = {
      id,
      name: request?.body?.name as string,
      description: request?.body?.description as string,
      price: request?.body?.price as number,
      inStock: request?.body?.inStock as number,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    jest.spyOn(updatePartOrSupply, 'update').mockResolvedValue(partOrSupply);

    const response = await updatePartOrSupplyController.handle(request);

    expect(response).toEqual(ok(partOrSupply));
    expect(updatePartOrSupply.update).toHaveBeenCalledWith({
      id,
      ...request.body,
    });
  });

  it('should return 500 ServerError if UpdatePartOrSupply throws', async () => {
    const request: HttpRequest<Omit<UpdatePartOrSupply.Params, 'id'>> = {
      params: { id: faker.string.uuid() },
      body: {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price()),
        inStock: faker.number.int({ min: 1, max: 100 }),
      },
    };
    jest.spyOn(updatePartOrSupply, 'update').mockRejectedValue(new Error());

    const response = await updatePartOrSupplyController.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
