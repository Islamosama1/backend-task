export type HTTPResponse<T> = {
  data: T;
  message?: string;
};

export type PaginatedHTTPResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};
