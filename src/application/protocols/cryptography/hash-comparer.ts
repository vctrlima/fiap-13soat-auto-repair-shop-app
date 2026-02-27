export interface HashComparer {
  compare: (input: string, digest: string) => Promise<boolean>;
}
