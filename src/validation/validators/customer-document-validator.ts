import { InvalidFieldError } from '@/validation/errors';
import { type ParameterValidator } from '@/validation/protocols';

export class CustomerDocumentValidator implements ParameterValidator {
  validate(input: string): Error | null {
    if (!input || typeof input !== 'string') {
      return new InvalidFieldError('document');
    }
    const cleanDocument = input.replace(/\D/g, '');
    if (cleanDocument.length === 11) {
      return this.validateCPF(cleanDocument) ? null : new InvalidFieldError('document');
    }
    if (cleanDocument.length === 14) {
      return this.validateCNPJ(cleanDocument) ? null : new InvalidFieldError('document');
    }
    return new InvalidFieldError('document');
  }

  private validateCPF(cpf: string): boolean {
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cpf[i]) * (10 - i);
    }
    let remainder = sum % 11;
    const firstCheckDigit = remainder < 2 ? 0 : 11 - remainder;
    if (parseInt(cpf[9]) !== firstCheckDigit) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cpf[i]) * (11 - i);
    }
    remainder = sum % 11;
    const secondCheckDigit = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(cpf[10]) === secondCheckDigit;
  }

  private validateCNPJ(cnpj: string): boolean {
    if (/^(\d)\1{13}$/.test(cnpj)) return false;

    const firstWeightFactors = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cnpj[i]) * firstWeightFactors[i];
    }
    let remainder = sum % 11;
    const firstCheckDigit = remainder < 2 ? 0 : 11 - remainder;
    if (parseInt(cnpj[12]) !== firstCheckDigit) return false;

    const secondWeightFactors = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cnpj[i]) * secondWeightFactors[i];
    }
    remainder = sum % 11;
    const secondCheckDigit = remainder < 2 ? 0 : 11 - remainder;

    return parseInt(cnpj[13]) === secondCheckDigit;
  }
}
