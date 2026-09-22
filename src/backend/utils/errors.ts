export abstract class AppError extends Error {
  abstract readonly statusCode: number;
  abstract readonly errorCode: string;

  constructor(message: string, public readonly details?: any) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      code: this.errorCode,
      message: this.message,
      ...(this.details ? { details: this.details } : {})
    };
  }
}

export class ValidationError extends AppError {
  readonly statusCode = 400;
  readonly errorCode = 'VALIDATION_ERROR';
}

export class AuthenticationError extends AppError {
  readonly statusCode = 401;
  readonly errorCode = 'AUTHENTICATION_ERROR';
}

export class AuthorizationError extends AppError {
  readonly statusCode = 403;
  readonly errorCode = 'AUTHORIZATION_ERROR';
}

export class NotFoundError extends AppError {
  readonly statusCode = 404;
  readonly errorCode = 'NOT_FOUND_ERROR';
}

export class RateLimitError extends AppError {
  readonly statusCode = 429;
  readonly errorCode = 'RATE_LIMIT_EXCEEDED';
}

export class FileProcessingError extends AppError {
  readonly statusCode = 422;
  readonly errorCode = 'FILE_PROCESSING_ERROR';
}

export class AIProviderError extends AppError {
  readonly statusCode = 502;
  readonly errorCode = 'AI_PROVIDER_ERROR';
}

export class LegalRetrievalError extends AppError {
  readonly statusCode = 502;
  readonly errorCode = 'LEGAL_RETRIEVAL_ERROR';
}

export class DatabaseError extends AppError {
  readonly statusCode = 500;
  readonly errorCode = 'DATABASE_ERROR';
}

export class AnalysisError extends AppError {
  readonly statusCode = 500;
  readonly errorCode = 'ANALYSIS_ERROR';
}
