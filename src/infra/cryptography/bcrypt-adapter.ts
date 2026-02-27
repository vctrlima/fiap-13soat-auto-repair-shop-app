import { HashComparer, Hasher } from '@/application/protocols/cryptography';
import bcrypt from 'bcrypt';

export class BcryptAdapter implements Hasher, HashComparer {
  constructor(private readonly salt: number) {}

  async hash(input: string): Promise<string> {
    return bcrypt.hash(input, this.salt);
  }

  async compare(input: string, digest: string): Promise<boolean> {
    return bcrypt.compare(input, digest);
  }
}
