/**
 * Cursor-based pagination utilities
 */

export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
  direction?: "forward" | "backward";
}

export interface CursorPaginationResult<T> {
  data: T[];
  nextCursor: string | null;
  prevCursor: string | null;
  hasMore: boolean;
}

/**
 * Get paginated results with cursor
 */
export async function getPaginatedResults<T extends { id: string; createdAt: Date }>(
  fetcher: (args: {
    cursor?: { id: string };
    take: number;
    skip?: number;
    orderBy: { createdAt: "asc" | "desc" };
  }) => Promise<T[]>,
  params: CursorPaginationParams = {}
): Promise<CursorPaginationResult<T>> {
  const limit = Math.min(params.limit || 20, 100); // Max 100 items
  const direction = params.direction || "forward";
  const cursor = params.cursor;

  // For forward pagination
  if (direction === "forward" || !cursor) {
    const results = await fetcher({
      cursor: cursor ? { id: cursor } : undefined,
      take: limit + 1, // Fetch one extra to check if there's more
      orderBy: { createdAt: "desc" },
    });

    const hasMore = results.length > limit;
    const data = hasMore ? results.slice(0, -1) : results;
    const nextCursor = hasMore ? data[data.length - 1]?.id || null : null;
    const prevCursor = cursor || null;

    return {
      data,
      nextCursor,
      prevCursor,
      hasMore,
    };
  }

  // For backward pagination
  const results = await fetcher({
    cursor: cursor ? { id: cursor } : undefined,
    take: limit + 1,
    orderBy: { createdAt: "asc" },
  });

  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, -1).reverse() : results.reverse();
  const nextCursor = cursor || null;
  const prevCursor = hasMore ? (data[0]?.id || null) : null;

  return {
    data,
    nextCursor,
    prevCursor,
    hasMore,
  };
}

/**
 * Offset-based pagination (for compatibility)
 */
export interface OffsetPaginationParams {
  page?: number;
  limit?: number;
}

export interface OffsetPaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

export async function getOffsetPaginatedResults<T>(
  fetcher: (args: { skip: number; take: number }) => Promise<{ data: T[]; total: number }>,
  params: OffsetPaginationParams = {}
): Promise<OffsetPaginationResult<T>> {
  const page = Math.max(1, params.page || 1);
  const limit = Math.min(params.limit || 20, 100);
  const skip = (page - 1) * limit;

  const { data, total } = await fetcher({ skip, take: limit });
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
}

