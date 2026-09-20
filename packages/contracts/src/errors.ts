/**
 * NXTQR — Core Domain Errors
 * Structured, type-safe errors mapped across domain boundaries.
 * Prevents leaking raw SQL, D1, or internal implementation details.
 */

export abstract class DomainError extends Error {
  abstract readonly code: string;
  abstract readonly statusCode: number;

  constructor(message: string, public readonly details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
      },
    };
  }
}

export class NotFoundError extends DomainError {
  readonly code = "RESOURCE_NOT_FOUND";
  readonly statusCode = 404;
}

export class UnauthorizedError extends DomainError {
  readonly code = "AUTHENTICATION_REQUIRED";
  readonly statusCode = 401;
}

export class ForbiddenError extends DomainError {
  readonly code = "PERMISSION_DENIED";
  readonly statusCode = 403;
}

export class ConflictError extends DomainError {
  readonly code = "RESOURCE_CONFLICT";
  readonly statusCode = 409;
}

export class ValidationError extends DomainError {
  readonly code = "VALIDATION_FAILED";
  readonly statusCode = 422;
}

export class EntitlementError extends DomainError {
  readonly code = "ENTITLEMENT_LIMIT_EXCEEDED";
  readonly statusCode = 402;
}

export class InvalidStateTransitionError extends DomainError {
  readonly code = "INVALID_STATE_TRANSITION";
  readonly statusCode = 400;
}

export class SecurityRiskError extends DomainError {
  readonly code = "SECURITY_POLICY_VIOLATION";
  readonly statusCode = 400;
}
