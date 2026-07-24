import { ErrorCode, ERROR_CODES } from "./constants";

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly metadata?: Record<string, unknown>;
  public readonly traceId?: string;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = ERROR_CODES.UNKNOWN,
    metadata?: Record<string, unknown>,
    options?: ErrorOptions,
    traceId?: string,
  ) {
    // Pass original options (e.g. { cause }) to native Error
    super(message, options);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.metadata = metadata;
    this.traceId = traceId;

    // Restore prototype chain for ES5/TypeScript subclassing compatibility
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
