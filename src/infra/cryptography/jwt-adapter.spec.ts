import jwt from "jsonwebtoken";
import { JwtAdapter } from "./jwt-adapter";

export const throwError = (): never => {
  throw new Error();
};

jest.mock("jsonwebtoken", () => ({
  async sign(): Promise<string> {
    return "any_token";
  },

  async verify(): Promise<string> {
    return "any_value";
  },
}));

const makeSut = (): JwtAdapter => {
  return new JwtAdapter();
};

describe("Jwt Adapter", () => {
  describe("sign", () => {
    it("should call sign with correct values", async () => {
      const sut = makeSut();
      const signSpy = jest.spyOn(jwt, "sign");

      await sut.encrypt({ plainText: "any_id", secret: "secret" });

      expect(signSpy).toHaveBeenCalledWith({ id: "any_id" }, "secret", {
        expiresIn: "30m",
        issuer: "https://auto-repair-shop.auth",
        audience: "auto-repair-shop-api",
      });
    });

    it("should call sign with correct expiration", async () => {
      const sut = makeSut();
      const signSpy = jest.spyOn(jwt, "sign");

      await sut.encrypt({
        plainText: "any_id",
        secret: "secret",
        expiresIn: "1d",
      });

      expect(signSpy).toHaveBeenCalledWith({ id: "any_id" }, "secret", {
        expiresIn: "1d",
        issuer: "https://auto-repair-shop.auth",
        audience: "auto-repair-shop-api",
      });
    });

    it("should call sign with correct jwt id", async () => {
      const sut = makeSut();
      const signSpy = jest.spyOn(jwt, "sign");

      await sut.encrypt({
        plainText: "any_id",
        secret: "secret",
        expiresIn: "20m",
        jti: "any_jti",
      });

      expect(signSpy).toHaveBeenCalledWith(
        { id: "any_id", jti: "any_jti" },
        "secret",
        {
          expiresIn: "20m",
          issuer: "https://auto-repair-shop.auth",
          audience: "auto-repair-shop-api",
        },
      );
    });

    it("should return a token on sign success", async () => {
      const sut = makeSut();

      const accessToken = await sut.encrypt({
        plainText: "any_id",
        secret: "secret",
      });

      expect(accessToken).toBe("any_token");
    });

    it("should throw if sign throws", async () => {
      const sut = makeSut();
      jest.spyOn(jwt, "sign").mockImplementationOnce(throwError);

      const promise = sut.encrypt({ plainText: "any_id", secret: "secret" });

      await expect(promise).rejects.toThrow();
    });
  });

  describe("verify", () => {
    it("should call verify with correct values", async () => {
      const sut = makeSut();
      const verifySpy = jest.spyOn(jwt, "verify");

      await sut.decrypt({ cipherText: "any_token", secret: "secret" });

      expect(verifySpy).toHaveBeenCalledWith("any_token", "secret");
    });

    it("should return a value on verify success", async () => {
      const sut = makeSut();

      const value = await sut.decrypt({
        cipherText: "any_token",
        secret: "secret",
      });

      expect(value).toBe("any_value");
    });

    it("should throw if verify throws", async () => {
      const sut = makeSut();
      jest.spyOn(jwt, "verify").mockImplementationOnce(throwError);

      const promise = sut.decrypt({
        cipherText: "any_token",
        secret: "secret",
      });

      await expect(promise).rejects.toThrow();
    });
  });
});
