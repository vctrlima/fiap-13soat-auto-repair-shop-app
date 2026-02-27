import { Customer } from '@/domain/entities';
import { CreateCustomer } from '@/domain/use-cases';
import { MissingParamError } from '@/presentation/errors';
import { badRequest, created, serverError } from '@/presentation/helpers';
import { HttpRequest } from '@/presentation/protocols';
import { InvalidFieldError } from '@/validation/errors';
import { CustomerDocumentValidator } from '@/validation/validators';
import { faker } from '@faker-js/faker';
import { CreateCustomerController } from './create-customer-controller';

const createCustomerMock = (): CreateCustomer => ({
  create: jest.fn(),
});

const customerDocumentValidatorMock = (): CustomerDocumentValidator =>
  ({
    validate: jest.fn(),
  } as any);

describe('CreateCustomerController', () => {
  let createCustomer: CreateCustomer;
  let customerDocumentValidator: CustomerDocumentValidator;
  let createCustomerController: CreateCustomerController;

  beforeEach(() => {
    createCustomer = createCustomerMock();
    customerDocumentValidator = customerDocumentValidatorMock();
    createCustomerController = new CreateCustomerController(createCustomer, customerDocumentValidator);
  });

  it('should create a new customer and return 200 OK', async () => {
    const document = '11144477735';
    const request: HttpRequest<CreateCustomer.Params> = {
      body: {
        document: document,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
      },
    };
    const customer = {
      id: faker.string.uuid(),
      ...request.body,
      vehicles: [],
      createdAt: new Date(),
      updatedAt: null,
    } as Customer;
    jest.spyOn(customerDocumentValidator, 'validate').mockReturnValue(null);
    jest.spyOn(createCustomer, 'create').mockResolvedValue(customer);

    const response = await createCustomerController.handle(request);

    expect(customerDocumentValidator.validate).toHaveBeenCalledWith(document);
    expect(createCustomer.create).toHaveBeenCalledWith(request.body);
    expect(response).toEqual(created(customer));
  });

  it('should return 400 BadRequest if body is missing', async () => {
    const request: HttpRequest<CreateCustomer.Params> = {};

    const response = await createCustomerController.handle(request);

    expect(response).toEqual(badRequest(new MissingParamError('body')));
  });

  it('should return 400 BadRequest if document validation fails', async () => {
    const document = '11111111111';
    const request: HttpRequest<CreateCustomer.Params> = {
      body: {
        document: document,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
      },
    };
    const validationError = new InvalidFieldError('document [cpf]');
    jest.spyOn(customerDocumentValidator, 'validate').mockReturnValue(validationError);

    const response = await createCustomerController.handle(request);

    expect(customerDocumentValidator.validate).toHaveBeenCalledWith(document);
    expect(createCustomer.create).not.toHaveBeenCalled();
    expect(response).toEqual(badRequest(validationError));
  });

  it('should return 400 BadRequest if CNPJ validation fails', async () => {
    const document = '11111111111111';
    const request: HttpRequest<CreateCustomer.Params> = {
      body: {
        document: document,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
      },
    };
    const validationError = new InvalidFieldError('document [cnpj]');
    jest.spyOn(customerDocumentValidator, 'validate').mockReturnValue(validationError);

    const response = await createCustomerController.handle(request);

    expect(customerDocumentValidator.validate).toHaveBeenCalledWith(document);
    expect(createCustomer.create).not.toHaveBeenCalled();
    expect(response).toEqual(badRequest(validationError));
  });

  it('should return 500 ServerError if CreateCustomer throws', async () => {
    const document = '11144477735';
    const request: HttpRequest<CreateCustomer.Params> = {
      body: {
        document: document,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
      },
    };
    const error = new Error('Database error');
    jest.spyOn(customerDocumentValidator, 'validate').mockReturnValue(null);
    jest.spyOn(createCustomer, 'create').mockRejectedValue(error);

    const response = await createCustomerController.handle(request);

    expect(customerDocumentValidator.validate).toHaveBeenCalledWith(document);
    expect(createCustomer.create).toHaveBeenCalledWith(request.body);
    expect(response).toEqual(serverError(error));
  });

  it('should create a customer with valid CNPJ', async () => {
    const document = '11222333000181';
    const request: HttpRequest<CreateCustomer.Params> = {
      body: {
        document: document,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
      },
    };
    const customer = {
      id: faker.string.uuid(),
      ...request.body,
      vehicles: [],
      createdAt: new Date(),
      updatedAt: null,
    } as Customer;
    jest.spyOn(customerDocumentValidator, 'validate').mockReturnValue(null);
    jest.spyOn(createCustomer, 'create').mockResolvedValue(customer);

    const response = await createCustomerController.handle(request);

    expect(customerDocumentValidator.validate).toHaveBeenCalledWith(document);
    expect(createCustomer.create).toHaveBeenCalledWith(request.body);
    expect(response).toEqual(created(customer));
  });
});
