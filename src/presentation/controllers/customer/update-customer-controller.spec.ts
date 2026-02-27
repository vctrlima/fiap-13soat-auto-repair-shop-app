import { Customer } from '@/domain/entities';
import { UpdateCustomer } from '@/domain/use-cases';
import { NotFoundError } from '@/presentation/errors';
import { badRequest, notFound, ok, serverError } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { InvalidFieldError } from '@/validation/errors';
import { CustomerDocumentValidator } from '@/validation/validators';
import { faker } from '@faker-js/faker';
import { UpdateCustomerController } from './update-customer-controller';

const updateCustomerMock = (): UpdateCustomer => ({
  update: jest.fn(),
});

const customerDocumentValidatorMock = (): CustomerDocumentValidator =>
  ({
    validate: jest.fn(),
  } as any);

describe('UpdateCustomerController', () => {
  let updateCustomer: UpdateCustomer;
  let customerDocumentValidator: CustomerDocumentValidator;
  let updateCustomerController: UpdateCustomerController;

  beforeEach(() => {
    updateCustomer = updateCustomerMock();
    customerDocumentValidator = customerDocumentValidatorMock();
    updateCustomerController = new UpdateCustomerController(updateCustomer, customerDocumentValidator);
  });

  it('should update customer and return 200 OK', async () => {
    const document = '11144477735';
    const request: HttpRequest = {
      params: { document },
      body: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
      },
    };
    const customer = {
      id: faker.string.uuid(),
      document: document,
      ...request.body,
      vehicles: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Customer;
    jest.spyOn(customerDocumentValidator, 'validate').mockReturnValue(null);
    jest.spyOn(updateCustomer, 'update').mockResolvedValue(customer);

    const response = await updateCustomerController.handle(request);

    expect(customerDocumentValidator.validate).toHaveBeenCalledWith(document);
    expect(updateCustomer.update).toHaveBeenCalledWith({ ...request.body, document });
    expect(response).toEqual(ok(customer));
  });

  it('should return 400 BadRequest if params document validation fails', async () => {
    const document = '11111111111';
    const request: HttpRequest = {
      params: { document },
      body: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
      },
    };
    const validationError = new InvalidFieldError('document [cpf]');
    jest.spyOn(customerDocumentValidator, 'validate').mockReturnValue(validationError);

    const response = await updateCustomerController.handle(request);

    expect(customerDocumentValidator.validate).toHaveBeenCalledWith(document);
    expect(updateCustomer.update).not.toHaveBeenCalled();
    expect(response).toEqual(badRequest(validationError));
  });

  it('should return 400 BadRequest if body document validation fails', async () => {
    const paramsDocument = '11144477735';
    const bodyDocument = '11111111111';
    const request: HttpRequest = {
      params: { document: paramsDocument },
      body: {
        document: bodyDocument,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
      },
    };
    const validationError = new InvalidFieldError('document [cpf]');
    jest
      .spyOn(customerDocumentValidator, 'validate')
      .mockReturnValueOnce(null)
      .mockReturnValueOnce(validationError);

    const response = await updateCustomerController.handle(request);

    expect(customerDocumentValidator.validate).toHaveBeenCalledWith(paramsDocument);
    expect(customerDocumentValidator.validate).toHaveBeenCalledWith(bodyDocument);
    expect(updateCustomer.update).not.toHaveBeenCalled();
    expect(response).toEqual(badRequest(validationError));
  });

  it('should update customer with valid CNPJ documents', async () => {
    const paramsDocument = '11222333000181';
    const bodyDocument = '34073077000108';
    const request: HttpRequest = {
      params: { document: paramsDocument },
      body: {
        document: bodyDocument,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
      },
    };
    const customer = {
      id: faker.string.uuid(),
      document: paramsDocument,
      ...request.body,
      vehicles: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Customer;
    jest.spyOn(customerDocumentValidator, 'validate').mockReturnValue(null);
    jest.spyOn(updateCustomer, 'update').mockResolvedValue(customer);

    const response = await updateCustomerController.handle(request);

    expect(customerDocumentValidator.validate).toHaveBeenCalledWith(paramsDocument);
    expect(customerDocumentValidator.validate).toHaveBeenCalledWith(bodyDocument);
    expect(updateCustomer.update).toHaveBeenCalledWith({ ...request.body, document: paramsDocument });
    expect(response).toEqual(ok(customer));
  });

  it('should return 404 NotFound if UpdateCustomer throws NotFoundError', async () => {
    const document = '11144477735';
    const request: HttpRequest = {
      params: { document },
      body: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
      },
    };
    const notFoundError = new NotFoundError('Customer not found');
    jest.spyOn(customerDocumentValidator, 'validate').mockReturnValue(null);
    jest.spyOn(updateCustomer, 'update').mockRejectedValue(notFoundError);

    const response = await updateCustomerController.handle(request);

    expect(customerDocumentValidator.validate).toHaveBeenCalledWith(document);
    expect(updateCustomer.update).toHaveBeenCalledWith({ ...request.body, document });
    expect(response).toEqual(notFound(notFoundError));
  });

  it('should return 500 ServerError if UpdateCustomer throws other error', async () => {
    const document = '11144477735';
    const request: HttpRequest = {
      params: { document },
      body: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
      },
    };
    const error = new Error('Database error');
    jest.spyOn(customerDocumentValidator, 'validate').mockReturnValue(null);
    jest.spyOn(updateCustomer, 'update').mockRejectedValue(error);

    const response = await updateCustomerController.handle(request);

    expect(customerDocumentValidator.validate).toHaveBeenCalledWith(document);
    expect(updateCustomer.update).toHaveBeenCalledWith({ ...request.body, document });
    expect(response).toEqual(serverError(error));
  });
});
