import { InvalidFieldError } from '@/validation/errors';
import { type ParameterValidator } from '@/validation/protocols';

export class PasswordValidator implements ParameterValidator {
  public get capitalLettersRegExp(): string {
    return /(?=.*[A-Z])/.source;
  }

  public get numbersRegExp(): string {
    return /(?=.*[0-9])/.source;
  }

  public get symbolsRegExp(): string {
    return /(?=.*[!@#$%^&*])/.source;
  }

  public validate(input: string): Error | null {
    const passwordRegExp = new RegExp(this.capitalLettersRegExp + this.numbersRegExp + this.symbolsRegExp);
    return passwordRegExp.test(input) ? null : new InvalidFieldError('password');
  }
}
