export interface PageParams {
  page: number;
  limit: number;
  skip: number;
}

export function parsePageParams(query: Record<string, unknown>, defaults = { page: 1, limit: 20, max: 100 }): PageParams {
  const page = Math.max(1, Number.parseInt(String(query.page ?? defaults.page), 10) || defaults.page);
  const rawLimit = Number.parseInt(String(query.limit ?? defaults.limit), 10) || defaults.limit;
  const limit = Math.min(defaults.max, Math.max(1, rawLimit));
  return { page, limit, skip: (page - 1) * limit };
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function buildPageMeta(total: number, params: PageParams): PageMeta {
  return { page: params.page, limit: params.limit, total, totalPages: Math.max(1, Math.ceil(total / params.limit)) };
}
