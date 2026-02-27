import { NotFoundError } from './not-found-error';

describe('NotFoundError', () => {
  it('should have the correct error message', () => {
    const error = new NotFoundError('some stack trace');

    expect(error.message).toBe('Not found error');
  });

  it('should have the correct error name', () => {
    const error = new NotFoundError('some stack trace');

    expect(error.name).toBe('NotFoundError');
  });

  it('should have the correct stack trace', () => {
    const stack = 'some stack trace';

    const error = new NotFoundError(stack);

    expect(error.stack).toBe(stack);
  });

  it('should inherit from Error', () => {
    const error = new NotFoundError('some stack trace');

    expect(error instanceof Error).toBe(true);
  });
});
