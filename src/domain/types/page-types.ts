export interface DefaultPageParams {
  page: number;
  limit: number;
  orderBy?: string;
  orderDirection?: OrderDirection;
}

export interface Page<T> {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  content: T[];
}

export enum OrderDirection {
  ASC = 'asc',
  DESC = 'desc',
}
