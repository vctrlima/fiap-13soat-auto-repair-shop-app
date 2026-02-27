import { MissingParamError } from './missing-param-error';

describe('MissingParamError', () => {
  it('should have the correct error message', () => {
    const paramName = 'email';

    const error = new MissingParamError(paramName);

    expect(error.message).toBe(`Missing param: ${paramName}`);
  });

  it('should have the correct error name', () => {
    const error = new MissingParamError('password');

    expect(error.name).toBe('MissingParamError');
  });

  it('should inherit from Error', () => {
    const error = new MissingParamError('name');

    expect(error instanceof Error).toBe(true);
  });
});
