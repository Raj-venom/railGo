class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly success: false;
  public readonly data: null;

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    code: string = "INTERNAL_ERROR",
    stack?: string,
  ) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.success = false;
    this.data = null;

    // Maintain proper prototype chain
    Object.setPrototypeOf(this, new.target.prototype);

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class BadRequestError extends ApiError {
  constructor(
    message: string = "Bad Request",
    code: string = "BAD_REQUEST",
    stack?: string,
  ) {
    super(400, message, code, stack);
  }
}
class UnauthorizedError extends ApiError {
  constructor(
    message: string = "Unauthorized",
    code: string = "UNAUTHORIZED",
    stack?: string,
  ) {
    super(401, message, code, stack);
  }
}

class ForbiddenError extends ApiError {
  constructor(
    message: string = "Forbidden",
    code: string = "FORBIDDEN",
    stack?: string,
  ) {
    super(403, message, code, stack);
  }
}

class NotFoundError extends ApiError {
  constructor(
    message: string = "Not Found",
    code: string = "NOT_FOUND",
    stack?: string,
  ) {
    super(404, message, code, stack);
  }
}

class MethodNotAllowedError extends ApiError {
  constructor(
    message: string = "Method Not Allowed",
    code: string = "METHOD_NOT_ALLOWED",
    stack?: string,
  ) {
    super(405, message, code, stack);
  }
}

class ConflictError extends ApiError {
  constructor(
    message: string = "Conflict",
    code: string = "CONFLICT",
    stack?: string,
  ) {
    super(409, message, code, stack);
  }
}

class UnprocessableEntityError extends ApiError {
  constructor(
    message: string = "Unprocessable Entity",
    code: string = "UNPROCESSABLE_ENTITY",
    stack?: string,
  ) {
    super(422, message, code, stack);
  }
}

class TooManyRequestsError extends ApiError {
  constructor(
    message: string = "Too Many Requests",
    code: string = "TOO_MANY_REQUESTS",
    stack?: string,
  ) {
    super(429, message, code, stack);
  }
}

class InternalServerError extends ApiError {
  constructor(
    message: string = "Internal Server Error",
    code: string = "INTERNAL_SERVER_ERROR",
    stack?: string,
  ) {
    super(500, message, code, stack);
  }
}

class NotImplementedError extends ApiError {
  constructor(
    message: string = "Not Implemented",
    code: string = "NOT_IMPLEMENTED",
    stack?: string,
  ) {
    super(501, message, code, stack);
  }
}

class ServiceUnavailableError extends ApiError {
  constructor(
    message: string = "Service Unavailable",
    code: string = "SERVICE_UNAVAILABLE",
    stack?: string,
  ) {
    super(503, message, code, stack);
  }
}

export {
  ApiError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  MethodNotAllowedError,
  ConflictError,
  UnprocessableEntityError,
  TooManyRequestsError,
  InternalServerError,
  NotImplementedError,
  ServiceUnavailableError,
};
