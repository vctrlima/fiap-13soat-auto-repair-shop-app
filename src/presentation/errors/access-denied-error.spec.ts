import { AccessDeniedError } from './access-denied-error';

describe('AccessDeniedError', () => {
  it('should have the correct error message', () => {
    const error = new AccessDeniedError();

    expect(error.message).toBe('Access denied');
  });

  it('should have the correct error name', () => {
    const error = new AccessDeniedError();

    expect(error.name).toBe('AccessDeniedError');
  });

  it('should inherit from Error', () => {
    const error = new AccessDeniedError();

    expect(error instanceof Error).toBe(true);
  });
});
