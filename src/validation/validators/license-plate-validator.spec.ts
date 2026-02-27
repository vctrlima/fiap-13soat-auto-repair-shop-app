import { LicensePlateValidator } from './license-plate-validator';

const createValidator = () => new LicensePlateValidator();

describe('LicensePlateValidator', () => {
  it('returns null for a valid classic plate with dash', () => {
    const validator = createValidator();

    expect(validator.validate('ABC-1234')).toBeNull();
  });

  it('returns null for a classic plate after normalization removes extra characters', () => {
    const validator = createValidator();

    expect(validator.validate('  a.b c-1234  ')).toBeNull();
  });

  it('returns null for a valid modern plate', () => {
    const validator = createValidator();

    expect(validator.validate('ABC1D23')).toBeNull();
  });

  it('returns InvalidFieldError for an invalid plate pattern', () => {
    const validator = createValidator();

    const error = validator.validate('AB12C34');

    expect(error).toBeInstanceOf(Error);
    expect(error?.constructor.name).toBe('InvalidFieldError');
  });

  it('returns InvalidFieldError when plate is empty', () => {
    const validator = createValidator();

    const error = validator.validate('');

    expect(error).toBeInstanceOf(Error);
    expect(error?.constructor.name).toBe('InvalidFieldError');
  });
});
