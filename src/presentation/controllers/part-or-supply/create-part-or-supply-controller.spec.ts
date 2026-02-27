import { PartOrSupply } from '@/domain/entities';
import { CreatePartOrSupply } from '@/domain/use-cases';
import { created } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { faker } from '@faker-js/faker';
import { CreatePartOrSupplyController } from './create-part-or-supply-controller';

const createPartOrSupplyMock = (): CreatePartOrSupply => ({
  create: jest.fn(),
});

describe('CreatePartOrSupplyController', () => {
  let createPartOrSupply: CreatePartOrSupply;
  let createPartOrSupplyController: CreatePartOrSupplyController;

  beforeEach(() => {
    createPartOrSupply = createPartOrSupplyMock();
    createPartOrSupplyController = new CreatePartOrSupplyController(createPartOrSupply);
  });

  it('should create a new part or supply and return 200 OK', async () => {
    const request: HttpRequest<CreatePartOrSupply.Params> = {
      body: {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price()),
        inStock: faker.number.int({ min: 1, max: 100 }),
      },
    };
    const partOrSupply = {
      id: faker.string.uuid(),
      ...request.body,
      createdAt: new Date(),
      updatedAt: undefined,
    } as PartOrSupply;
    jest.spyOn(createPartOrSupply, 'create').mockResolvedValue(partOrSupply);

    const response = await createPartOrSupplyController.handle(request);

    expect(response).toEqual(created(partOrSupply));
    expect(createPartOrSupply.create).toHaveBeenCalledWith(request.body);
  });

  it('should return 500 ServerError if CreatePartOrSupply throws', async () => {
    const request: HttpRequest<CreatePartOrSupply.Params> = {
      body: {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        price: Number(faker.commerce.price()),
        inStock: faker.number.int({ min: 1, max: 100 }),
      },
    };
    jest.spyOn(createPartOrSupply, 'create').mockRejectedValue(new Error());

    const response = await createPartOrSupplyController.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
