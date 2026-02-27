export interface Encrypter {
  encrypt: (params: Encrypter.Params) => Promise<string>;
}

export namespace Encrypter {
  export interface Params {
    plainText: string;
    secret: string;
    expiresIn?: string;
    jti?: string | undefined;
  }
}
