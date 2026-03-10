import { DbGetCustomerByToken } from "@/application/use-cases";
import { GetCustomerByToken } from "@/domain/use-cases";
import { JwtAdapter } from "@/infra/cryptography";

export const makeGetCustomerByToken = (): GetCustomerByToken => {
  const jwtAdapter = new JwtAdapter();
  return new DbGetCustomerByToken(jwtAdapter);
};
