import { PartOrSupply } from '@/domain/entities';
import { GetAllPartsOrSupplies } from '@/domain/use-cases';
import { ok } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { faker } from '@faker-js/faker';
import { GetAllPartsOrSuppliesController } from './get-all-parts-or-supplies-controller';

const getAllPartsOrSuppliesMock = (): GetAllPartsOrSupplies => ({
  getAll: jest.fn(),
});

describe('GetAllPartsOrSuppliesController', () => {
  let getAllPartsOrSupplies: GetAllPartsOrSupplies;
  let getAllPartsOrSuppliesController: GetAllPartsOrSuppliesController;

  beforeEach(() => {
    getAllPartsOrSupplies = getAllPartsOrSuppliesMock();
    getAllPartsOrSuppliesController = new GetAllPartsOrSuppliesController(getAllPartsOrSupplies);
  });

  it('should get all parts or supplies and return 200 OK', async () => {
    const request: HttpRequest<GetAllPartsOrSupplies.Params> = {
      query: {
        page: 1,
        limit: 10,
        name: faker.commerce.productName(),
        inStock: true,
      },
    };
    const partsOrSupplies: PartOrSupply[] = [
      {
        id: faker.string.uuid(),
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price()),
        inStock: faker.number.int({ min: 1, max: 100 }),
        createdAt: new Date(),
        updatedAt: undefined,
      },
    ];
    const result: GetAllPartsOrSupplies.Result = {
      content: partsOrSupplies,
      total: partsOrSupplies.length,
      page: request.query.page,
      limit: request.query.limit,
      totalPages: 1,
    };
    jest.spyOn(getAllPartsOrSupplies, 'getAll').mockResolvedValue(result);

    const response = await getAllPartsOrSuppliesController.handle(request);

    expect(response).toEqual(ok(result));
    expect(getAllPartsOrSupplies.getAll).toHaveBeenCalledWith(request.query);
  });

  it('should return 500 ServerError if GetAllPartsOrSupplies throws', async () => {
    const request: HttpRequest<GetAllPartsOrSupplies.Params> = {
      query: {
        page: 1,
        limit: 10,
      },
    };
    jest.spyOn(getAllPartsOrSupplies, 'getAll').mockRejectedValue(new Error());

    const response = await getAllPartsOrSuppliesController.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
