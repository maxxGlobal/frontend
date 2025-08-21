export type SortDirection = "asc" | "desc";

export interface PageRequest {
  page: number; // 0-based
  size: number;
  sortBy: string;
  sortDirection: SortDirection;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}
