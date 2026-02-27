import { CustomerDocumentValidator } from '@/validation/validators';

export const makeCustomerDocumentValidator = (): CustomerDocumentValidator => new CustomerDocumentValidator();
