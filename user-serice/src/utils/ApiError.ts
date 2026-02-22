export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly errors: unknown[];
    public readonly success: false;
    public readonly data: null;
  
    constructor(
      statusCode: number,
      message: string = 'Something went wrong',
      errors: unknown[] = [],
      stack?: string
    ) {
      super(message);
  
      this.statusCode = statusCode;
      this.errors = errors;
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
  