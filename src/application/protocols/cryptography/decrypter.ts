export interface Decrypter {
  decrypt: (params: Decrypter.Params) => Promise<any>;
}

export namespace Decrypter {
  export interface Params {
    cipherText: string;
    secret: string;
  }
}
