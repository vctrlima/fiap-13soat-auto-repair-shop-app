import { DeletePartOrSupply } from '@/domain/use-cases';
import { noContent } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { faker } from '@faker-js/faker';
import { DeletePartOrSupplyController } from './delete-part-or-supply-controller';

const deletePartOrSupplyMock = (): DeletePartOrSupply => ({
  delete: jest.fn(),
});

describe('DeletePartOrSupplyController', () => {
  let deletePartOrSupply: DeletePartOrSupply;
  let deletePartOrSupplyController: DeletePartOrSupplyController;

  beforeEach(() => {
    deletePartOrSupply = deletePartOrSupplyMock();
    deletePartOrSupplyController = new DeletePartOrSupplyController(deletePartOrSupply);
  });

  it('should delete part or supply and return 200 OK', async () => {
    const request: HttpRequest<DeletePartOrSupply.Params> = {
      params: { id: faker.string.uuid() },
    };
    jest.spyOn(deletePartOrSupply, 'delete').mockResolvedValue();

    const response = await deletePartOrSupplyController.handle(request);

    expect(response).toEqual(noContent());
    expect(deletePartOrSupply.delete).toHaveBeenCalledWith(request.params);
  });

  it('should return 500 ServerError if DeletePartOrSupply throws', async () => {
    const request: HttpRequest<DeletePartOrSupply.Params> = {
      params: { id: faker.string.uuid() },
    };
    jest.spyOn(deletePartOrSupply, 'delete').mockRejectedValue(new Error());

    const response = await deletePartOrSupplyController.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
