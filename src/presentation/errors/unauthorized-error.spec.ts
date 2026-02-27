import { UnauthorizedError } from './unauthorized-error';

describe('UnauthorizedError', () => {
  it('should have the correct error message', () => {
    const error = new UnauthorizedError();

    expect(error.message).toBe('Unauthorized');
  });

  it('should have the correct error name', () => {
    const error = new UnauthorizedError();

    expect(error.name).toBe('UnauthorizedError');
  });

  it('should inherit from Error', () => {
    const error = new UnauthorizedError();

    expect(error instanceof Error).toBe(true);
  });
});
