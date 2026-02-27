import { InvalidFieldError } from '@/validation/errors';
import { faker } from '@faker-js/faker';
import { EmailValidator } from './email-validator';

describe('EmailValidator', () => {
  it('should return null if email is valid', () => {
    const emailValidator = new EmailValidator();

    expect(emailValidator.validate(faker.internet.email())).toBeNull();
    expect(emailValidator.validate(faker.internet.email())).toBeNull();
    expect(emailValidator.validate(faker.internet.email())).toBeNull();
  });

  it('should return an InvalidFieldError if email is invalid', () => {
    const emailValidator = new EmailValidator();

    expect(emailValidator.validate('')).toBeInstanceOf(InvalidFieldError);
    expect(emailValidator.validate('test@example')).toBeInstanceOf(InvalidFieldError);
    expect(emailValidator.validate('test@example.')).toBeInstanceOf(InvalidFieldError);
    expect(emailValidator.validate('test@example..com')).toBeInstanceOf(InvalidFieldError);
    expect(emailValidator.validate('@example.com')).toBeInstanceOf(InvalidFieldError);
    expect(emailValidator.validate('test@.com')).toBeInstanceOf(InvalidFieldError);
    expect(emailValidator.validate('test@example..com')).toBeInstanceOf(InvalidFieldError);
  });
});
