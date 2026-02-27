import { InvalidFieldError } from '@/validation/errors';
import { CustomerDocumentValidator } from './customer-document-validator';

const makeSut = () => {
  return new CustomerDocumentValidator();
};

describe('CustomerDocumentValidator', () => {
  describe('validate', () => {
    describe('when input is invalid', () => {
      it('should return InvalidFieldError if input is null', () => {
        const sut = makeSut();

        const result = sut.validate(null as any);

        expect(result).toBeInstanceOf(InvalidFieldError);
        expect(result?.message).toBe('Invalid document value!');
      });

      it('should return InvalidFieldError if input is undefined', () => {
        const sut = makeSut();

        const result = sut.validate(undefined as any);

        expect(result).toBeInstanceOf(InvalidFieldError);
        expect(result?.message).toBe('Invalid document value!');
      });

      it('should return InvalidFieldError if input is not a string', () => {
        const sut = makeSut();

        const result = sut.validate(123 as any);

        expect(result).toBeInstanceOf(InvalidFieldError);
        expect(result?.message).toBe('Invalid document value!');
      });

      it('should return InvalidFieldError if input is empty string', () => {
        const sut = makeSut();

        const result = sut.validate('');

        expect(result).toBeInstanceOf(InvalidFieldError);
        expect(result?.message).toBe('Invalid document value!');
      });

      it('should return InvalidFieldError if input has invalid length', () => {
        const sut = makeSut();

        const result = sut.validate('123456789');

        expect(result).toBeInstanceOf(InvalidFieldError);
        expect(result?.message).toBe('Invalid document value!');
      });
    });

    describe('CPF validation', () => {
      it('should return null for valid CPF without formatting', () => {
        const sut = makeSut();

        const validCPF = '11144477735';

        const result = sut.validate(validCPF);
        expect(result).toBeNull();
      });

      it('should return null for valid CPF with formatting', () => {
        const sut = makeSut();

        const validCPF = '111.444.777-35';

        const result = sut.validate(validCPF);
        expect(result).toBeNull();
      });

      it('should return InvalidFieldError for CPF with all same digits', () => {
        const sut = makeSut();
        const invalidCPF = '11111111111';

        const result = sut.validate(invalidCPF);

        expect(result).toBeInstanceOf(InvalidFieldError);
        expect(result?.message).toBe('Invalid document value!');
      });

      it('should return InvalidFieldError for CPF with invalid check digits', () => {
        const sut = makeSut();
        const invalidCPF = '11144477736';

        const result = sut.validate(invalidCPF);

        expect(result).toBeInstanceOf(InvalidFieldError);
        expect(result?.message).toBe('Invalid document value!');
      });

      it('should return null for another valid CPF', () => {
        const sut = makeSut();

        const validCPF = '52998224725';

        const result = sut.validate(validCPF);
        expect(result).toBeNull();
      });

      it('should return InvalidFieldError for invalid CPF with wrong first check digit', () => {
        const sut = makeSut();
        const invalidCPF = '11144477745';

        const result = sut.validate(invalidCPF);

        expect(result).toBeInstanceOf(InvalidFieldError);
        expect(result?.message).toBe('Invalid document value!');
      });

      it('should return InvalidFieldError for invalid CPF with wrong second check digit', () => {
        const sut = makeSut();
        const invalidCPF = '11144477734';

        const result = sut.validate(invalidCPF);

        expect(result).toBeInstanceOf(InvalidFieldError);
        expect(result?.message).toBe('Invalid document value!');
      });
    });

    describe('CNPJ validation', () => {
      it('should return null for valid CNPJ without formatting', () => {
        const sut = makeSut();
        const validCNPJ = '11222333000181';

        const result = sut.validate(validCNPJ);

        expect(result).toBeNull();
      });

      it('should return null for valid CNPJ with formatting', () => {
        const sut = makeSut();
        const validCNPJ = '11.222.333/0001-81';

        const result = sut.validate(validCNPJ);

        expect(result).toBeNull();
      });

      it('should return InvalidFieldError for CNPJ with all same digits', () => {
        const sut = makeSut();
        const invalidCNPJ = '11111111111111';

        const result = sut.validate(invalidCNPJ);

        expect(result).toBeInstanceOf(InvalidFieldError);
        expect(result?.message).toBe('Invalid document value!');
      });

      it('should return InvalidFieldError for CNPJ with invalid check digits', () => {
        const sut = makeSut();
        const invalidCNPJ = '11222333000182';

        const result = sut.validate(invalidCNPJ);

        expect(result).toBeInstanceOf(InvalidFieldError);
        expect(result?.message).toBe('Invalid document value!');
      });

      it('should return InvalidFieldError for invalid CNPJ with wrong first check digit', () => {
        const sut = makeSut();
        const invalidCNPJ = '11222333000191';

        const result = sut.validate(invalidCNPJ);

        expect(result).toBeInstanceOf(InvalidFieldError);
        expect(result?.message).toBe('Invalid document value!');
      });

      it('should return InvalidFieldError for invalid CNPJ with wrong second check digit', () => {
        const sut = makeSut();
        const invalidCNPJ = '11222333000180';

        const result = sut.validate(invalidCNPJ);

        expect(result).toBeInstanceOf(InvalidFieldError);
        expect(result?.message).toBe('Invalid document value!');
      });
    });

    describe('edge cases', () => {
      it('should handle documents with mixed formatting characters', () => {
        const sut = makeSut();
        const document = '111.444.777-35 ';

        const result = sut.validate(document);

        expect(result).toBeNull();
      });

      it('should handle documents with letters and numbers', () => {
        const sut = makeSut();
        const document = 'ABC111444777DEF35';

        const result = sut.validate(document);

        expect(result).toBeNull();
      });

      it('should return InvalidFieldError for document with only letters', () => {
        const sut = makeSut();
        const document = 'ABCDEFGHIJK';

        const result = sut.validate(document);

        expect(result).toBeInstanceOf(InvalidFieldError);
        expect(result?.message).toBe('Invalid document value!');
      });

      it('should return InvalidFieldError for document with mixed length after cleaning', () => {
        const sut = makeSut();
        const document = '123.456.789.12';

        const result = sut.validate(document);

        expect(result).toBeInstanceOf(InvalidFieldError);
        expect(result?.message).toBe('Invalid document value!');
      });
    });
  });
});
