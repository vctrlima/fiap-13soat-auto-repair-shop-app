import { InvalidFieldError } from '@/validation/errors';
import { PasswordValidator } from './password-validator';

describe('PasswordValidator', () => {
  it('should return null if password is valid', () => {
    const passwordValidator = new PasswordValidator();

    expect(passwordValidator.validate('Password123!')).toBeNull();
    expect(passwordValidator.validate('Test@123')).toBeNull();
    expect(passwordValidator.validate('SuperSecret12!@')).toBeNull();
  });

  it('should return an InvalidFieldError if password is invalid', () => {
    const passwordValidator = new PasswordValidator();

    expect(passwordValidator.validate('')).toBeInstanceOf(InvalidFieldError);
    expect(passwordValidator.validate('123456789')).toBeInstanceOf(InvalidFieldError);
    expect(passwordValidator.validate('password')).toBeInstanceOf(InvalidFieldError);
    expect(passwordValidator.validate('password123')).toBeInstanceOf(InvalidFieldError);
    expect(passwordValidator.validate('PASSWORD123')).toBeInstanceOf(InvalidFieldError);
    expect(passwordValidator.validate('Test@')).toBeInstanceOf(InvalidFieldError);
    expect(passwordValidator.validate('test@123')).toBeInstanceOf(InvalidFieldError);
    expect(passwordValidator.validate('Test@')).toBeInstanceOf(InvalidFieldError);
  });
});
