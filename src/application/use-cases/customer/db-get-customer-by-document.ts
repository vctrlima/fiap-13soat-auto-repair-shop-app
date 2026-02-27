import { GetCustomerByDocumentRepository } from '@/application/protocols/db';
import { GetCustomerByDocument } from '@/domain/use-cases';

export class DbGetCustomerByDocument implements GetCustomerByDocument {
  constructor(private readonly getCustomerByDocumentRepository: GetCustomerByDocumentRepository) {}

  async getByDocument(params: GetCustomerByDocument.Params): Promise<GetCustomerByDocument.Result> {
    return await this.getCustomerByDocumentRepository.getByDocument(params);
  }
}
