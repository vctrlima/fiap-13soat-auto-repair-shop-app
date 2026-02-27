import { GetCustomerByDocumentRepository } from '@/application/protocols/db';
import { GetCustomerByDocument } from '@/domain/use-cases';
import { faker } from '@faker-js/faker';
import { DbGetCustomerByDocument } from './db-get-customer-by-document';

const getCustomerByDocumentRepositoryMock = (): GetCustomerByDocumentRepository => {
  return { getByDocument: jest.fn() } as GetCustomerByDocumentRepository;
};

describe('DbGetCustomerByDocument', () => {
  let getCustomerByDocumentRepository: GetCustomerByDocumentRepository;
  let dbGetCustomerByDocument: DbGetCustomerByDocument;

  beforeEach(() => {
    getCustomerByDocumentRepository = getCustomerByDocumentRepositoryMock();
    dbGetCustomerByDocument = new DbGetCustomerByDocument(getCustomerByDocumentRepository);
  });

  it('should get a customer by document', async () => {
    const params = { document: faker.string.uuid() };
    const data: GetCustomerByDocument.Result = {
      id: params.document,
      document: faker.string.numeric(11),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number({ style: 'international' }),
      vehicles: [],
      createdAt: new Date(),
      updatedAt: null,
    };
    jest.spyOn(getCustomerByDocumentRepository, 'getByDocument').mockResolvedValueOnce(data);

    const result = await dbGetCustomerByDocument.getByDocument(params);

    expect(getCustomerByDocumentRepository.getByDocument).toHaveBeenCalledWith(params);
    expect(result).toEqual(data);
  });
});
