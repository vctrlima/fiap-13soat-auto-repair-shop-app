import { PasswordValidator } from '@/validation/validators';

export const makePasswordValidator = (): PasswordValidator => new PasswordValidator();
