/**
 * API Response Types
 *
 * Shared types for API request/response structures.
 */

/**
 * Standard API response structure
 */
export interface ApiResponse<T = unknown> {
  message: string;
  data?: T;
  error?: string;
  errors?: Record<string, string>;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Paginated API response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination?: PaginationMeta;
}
