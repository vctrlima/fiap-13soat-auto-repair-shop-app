export class InvalidFieldError extends Error {
  constructor(field: string) {
    super(`Invalid ${field} value!`);
    this.name = 'InvalidFieldError';
  }
}
