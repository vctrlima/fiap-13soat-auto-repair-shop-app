import { Customer } from '@/domain/entities';
import { GetCustomerByDocument } from '@/domain/use-cases';
import { ok } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { faker } from '@faker-js/faker';
import { GetCustomerByDocumentController } from './get-customer-by-document-controller';

const getCustomerByDocumentMock = (): GetCustomerByDocument => ({
  getByDocument: jest.fn(),
});

describe('GetCustomerByDocumentController', () => {
  let getCustomerByDocument: GetCustomerByDocument;
  let getCustomerByDocumentController: GetCustomerByDocumentController;

  beforeEach(() => {
    getCustomerByDocument = getCustomerByDocumentMock();
    getCustomerByDocumentController = new GetCustomerByDocumentController(getCustomerByDocument);
  });

  it('should get customer by document and return 200 OK', async () => {
    const document = faker.string.numeric(11);
    const request: HttpRequest<GetCustomerByDocument.Params> = {
      params: { document },
    };
    const customer: Customer = {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      document,
      email: faker.internet.email(),
      phone: faker.phone.number(),
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(getCustomerByDocument, 'getByDocument').mockResolvedValue(customer);

    const response = await getCustomerByDocumentController.handle(request);

    expect(response).toEqual(ok(customer));
    expect(getCustomerByDocument.getByDocument).toHaveBeenCalledWith({ document });
  });

  it('should return 500 ServerError if GetCustomerByDocument throws', async () => {
    const request: HttpRequest<GetCustomerByDocument.Params> = {
      params: { document: faker.string.numeric(11) },
    };
    jest.spyOn(getCustomerByDocument, 'getByDocument').mockRejectedValue(new Error());

    const response = await getCustomerByDocumentController.handle(request);

    expect(response.statusCode).toBe(500);
    expect(response.body).toEqual({ error: 'Internal server error' });
  });
});
