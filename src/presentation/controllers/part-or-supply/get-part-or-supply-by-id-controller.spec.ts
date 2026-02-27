import { PartOrSupply } from '@/domain/entities';
import { GetPartOrSupplyById } from '@/domain/use-cases';
import { ok } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { faker } from '@faker-js/faker';
import { GetPartOrSupplyByIdController } from './get-part-or-supply-by-id-controller';

const getPartOrSupplyByIdMock = (): GetPartOrSupplyById => ({
  getById: jest.fn(),
});

describe('GetPartOrSupplyByIdController', () => {
  let getPartOrSupplyById: GetPartOrSupplyById;
  let getPartOrSupplyByIdController: GetPartOrSupplyByIdController;

  beforeEach(() => {
    getPartOrSupplyById = getPartOrSupplyByIdMock();
    getPartOrSupplyByIdController = new GetPartOrSupplyByIdController(getPartOrSupplyById);
  });

  it('should get part or supply by id and return 200 OK', async () => {
    const id = faker.string.uuid();
    const request: HttpRequest<GetPartOrSupplyById.Params> = {
      params: { id },
    };
    const partOrSupply: PartOrSupply = {
      id,
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      inStock: faker.number.int({ min: 1, max: 100 }),
      createdAt: new Date(),
      updatedAt: undefined,
    };
    jest.spyOn(getPartOrSupplyById, 'getById').mockResolvedValue(partOrSupply);

    const response = await getPartOrSupplyByIdController.handle(request);

    expect(response).toEqual(ok(partOrSupply));
    expect(getPartOrSupplyById.getById).toHaveBeenCalledWith({ id });
  });

  it('should return 500 ServerError if GetPartOrSupplyById throws', async () => {
    const request: HttpRequest<GetPartOrSupplyById.Params> = {
      params: { id: faker.string.uuid() },
    };
    jest.spyOn(getPartOrSupplyById, 'getById').mockRejectedValue(new Error());

    const response = await getPartOrSupplyByIdController.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
