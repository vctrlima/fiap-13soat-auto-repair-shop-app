import { DeleteCustomer } from '@/domain/use-cases';
import { noContent } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { faker } from '@faker-js/faker';
import { DeleteCustomerController } from './delete-customer-controller';

const deleteCustomerMock = (): DeleteCustomer => ({
  delete: jest.fn(),
});

describe('DeleteCustomerController', () => {
  let deleteCustomer: DeleteCustomer;
  let deleteCustomerController: DeleteCustomerController;

  beforeEach(() => {
    deleteCustomer = deleteCustomerMock();
    deleteCustomerController = new DeleteCustomerController(deleteCustomer);
  });

  it('should delete customer and return 200 OK', async () => {
    const request: HttpRequest<DeleteCustomer.Params> = {
      params: { document: faker.string.numeric(11) },
    };
    jest.spyOn(deleteCustomer, 'delete').mockResolvedValue();

    const response = await deleteCustomerController.handle(request);

    expect(response).toEqual(noContent());
    expect(deleteCustomer.delete).toHaveBeenCalledWith(request.params);
  });

  it('should return 500 ServerError if DeleteCustomer throws', async () => {
    const request: HttpRequest<DeleteCustomer.Params> = {
      params: { id: faker.string.uuid() },
    };
    jest.spyOn(deleteCustomer, 'delete').mockRejectedValue(new Error());

    const response = await deleteCustomerController.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
