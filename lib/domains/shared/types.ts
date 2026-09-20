/**
 * NXTQR — Common Domain Types
 */

export interface TenantContext {
  organizationId: string;
  actorUserId?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
