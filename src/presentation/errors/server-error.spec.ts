import { ServerError } from './server-error';

describe('ServerError', () => {
  it('should have the correct error message', () => {
    const error = new ServerError('some stack trace');

    expect(error.message).toBe('Internal server error');
  });

  it('should have the correct error name', () => {
    const error = new ServerError('some stack trace');

    expect(error.name).toBe('ServerError');
  });

  it('should have the correct stack trace', () => {
    const stack = 'some stack trace';

    const error = new ServerError(stack);

    expect(error.stack).toBe(stack);
  });

  it('should inherit from Error', () => {
    const error = new ServerError('some stack trace');

    expect(error instanceof Error).toBe(true);
  });
});
