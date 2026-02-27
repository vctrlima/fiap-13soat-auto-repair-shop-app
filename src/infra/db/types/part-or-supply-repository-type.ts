export interface PartOrSupplyRepositoryType {
  id: string;
  name?: string;
  description?: string | null;
  price: number;
  inStock?: number;
  createdAt: Date;
  updatedAt?: Date | null;
}
