export interface Pageable<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  last: boolean;
  totalPages: number;
  first: boolean;
  numberOfElements: number;
}
