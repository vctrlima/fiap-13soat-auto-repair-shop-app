import { EmailValidator } from '@/validation/validators';

export const makeEmailValidator = (): EmailValidator => new EmailValidator();
