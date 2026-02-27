export interface UserRepositoryType {
  id: string;
  name: string;
  email: string;
  password: string;
  role: any;
  createdAt: Date;
  updatedAt: Date | null;
}
