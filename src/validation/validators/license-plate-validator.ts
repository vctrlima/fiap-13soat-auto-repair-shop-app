import { InvalidFieldError } from '@/validation/errors';
import { ParameterValidator } from '@/validation/protocols';

export class LicensePlateValidator implements ParameterValidator {
  private get classicPlateRegExp() {
    return /^[A-Z]{3}-?\d{4}$/.source;
  }
  private get modernPlateRegExp() {
    return /^[A-Z]{3}\d[A-Z]\d{2}$/.source;
  }

  public validate(plate: string): Error | null {
    if (!plate) return new InvalidFieldError('licensePlate');
    const normalized = this.normalize(plate);
    const classicPlateRegExp = new RegExp(this.classicPlateRegExp);
    const modernPlateRegExp = new RegExp(this.modernPlateRegExp);
    if (classicPlateRegExp.test(normalized) || modernPlateRegExp.test(normalized)) return null;
    return new InvalidFieldError('licensePlate');
  }

  private normalize(plate: string): string {
    return plate
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '');
  }
}
