export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const BadRequest = (msg = "Bad request", details?: unknown) =>
  new AppError(400, "BAD_REQUEST", msg, details);

export const Unauthorized = (msg = "Unauthorized") => new AppError(401, "UNAUTHORIZED", msg);

export const Forbidden = (msg = "Forbidden") => new AppError(403, "FORBIDDEN", msg);

export const NotFound = (msg = "Not found") => new AppError(404, "NOT_FOUND", msg);

export const Conflict = (msg = "Conflict", details?: unknown) =>
  new AppError(409, "CONFLICT", msg, details);

export const UnprocessableEntity = (msg = "Unprocessable entity", details?: unknown) =>
  new AppError(422, "UNPROCESSABLE", msg, details);

export const TooManyRequests = (msg = "Too many requests") =>
  new AppError(429, "RATE_LIMITED", msg);

export const ServerError = (msg = "Internal server error") =>
  new AppError(500, "INTERNAL_ERROR", msg);
