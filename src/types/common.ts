export type ID = string;

export type ISODateString = string;

export type Pagination = {
  page: number;
  pageSize: number;
  total: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  pagination: Pagination;
};

export type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type SortDirection = "asc" | "desc";

export type SelectOption<V extends string | number = string> = {
  label: string;
  value: V;
};
