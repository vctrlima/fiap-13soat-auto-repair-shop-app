import { Decrypter } from "@/application/protocols/cryptography";
import { GetCustomerByToken } from "@/domain/use-cases";
import env from "@/main/config/env";

export class DbGetCustomerByToken implements GetCustomerByToken {
  constructor(private readonly decrypter: Decrypter) {}

  async getByToken(
    params: GetCustomerByToken.Params,
  ): Promise<GetCustomerByToken.Result> {
    const decoded = await this.decrypter.decrypt({
      cipherText: params.token,
      secret: env.jwtAccessTokenSecret,
    });

    if (decoded.type !== "customer" || !decoded.sub) {
      throw new Error("Invalid customer token");
    }

    return {
      id: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      document: decoded.cpf,
    };
  }
}
