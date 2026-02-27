export interface ParameterValidator {
  validate: (input: string) => Error | null;
}
