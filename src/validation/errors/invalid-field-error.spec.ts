import { InvalidFieldError } from './invalid-field-error';

describe('InvalidFieldError', () => {
  it('should have the correct error message', () => {
    const field = 'email';

    const error = new InvalidFieldError(field);

    expect(error.message).toBe(`Invalid ${field} value!`);
  });

  it('should have the correct error name', () => {
    const error = new InvalidFieldError('password');

    expect(error.name).toBe('InvalidFieldError');
  });

  it('should inherit from Error', () => {
    const error = new InvalidFieldError('name');

    expect(error instanceof Error).toBe(true);
  });
});
