import { CreateCustomerRepository } from "@/application/protocols/db";
import { CreateCustomer } from "@/domain/use-cases";
import { customerCreatedCounter } from "@/infra/observability";

export class DbCreateCustomer implements CreateCustomer {
  constructor(
    private readonly createCustomerRepository: CreateCustomerRepository,
  ) {}

  async create(params: CreateCustomer.Params): Promise<CreateCustomer.Result> {
    const result = await this.createCustomerRepository.create(params);
    customerCreatedCounter.add(1);
    return result;
  }
}
