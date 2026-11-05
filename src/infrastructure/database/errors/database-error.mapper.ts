import { DomainException } from '@domain/exceptions/domain.exception';
import { ArticleNotFoundException } from '@domain/exceptions/article-not-found.exception';
import { DuplicateEmailException } from '@domain/exceptions/duplicate-email.exception';
import { DuplicateUsernameException } from '@domain/exceptions/duplicate-username.exception';
import { InternalException } from '@domain/exceptions/internal.exception';
import { UserNotFoundException } from '@domain/exceptions/user-not-found.exception';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

interface PostgresDriverError {
  code?: string;
  constraint?: string;
  detail?: string;
}

const UNIQUE_VIOLATION_CODE = '23505';

const USER_EMAIL_CONSTRAINTS = new Set(['UQ_users_email']);
const USER_USERNAME_CONSTRAINTS = new Set(['UQ_users_username']);

const isQueryFailedError = (error: unknown): error is QueryFailedError =>
  error instanceof QueryFailedError;

const getDriverError = (error: QueryFailedError): PostgresDriverError =>
  (error.driverError ?? {}) as PostgresDriverError;

const isUniqueViolation = (error: unknown): error is QueryFailedError => {
  if (!isQueryFailedError(error)) {
    return false;
  }

  return getDriverError(error).code === UNIQUE_VIOLATION_CODE;
};

const matchesConstraint = (
  error: QueryFailedError,
  constraints: Set<string>,
  column: string,
): boolean => {
  const driverError = getDriverError(error);
  const constraint = driverError.constraint;

  if (constraint && constraints.has(constraint)) {
    return true;
  }

  return driverError.detail?.includes(`(${column})=`) ?? false;
};

export const mapUserPersistenceError = (error: unknown): never => {
  if (error instanceof DomainException) {
    throw error;
  }

  if (error instanceof EntityNotFoundError) {
    throw new UserNotFoundException();
  }

  if (isUniqueViolation(error)) {
    if (matchesConstraint(error, USER_EMAIL_CONSTRAINTS, 'email')) {
      throw new DuplicateEmailException();
    }

    if (matchesConstraint(error, USER_USERNAME_CONSTRAINTS, 'username')) {
      throw new DuplicateUsernameException();
    }
  }

  throw new InternalException(error);
};

export const mapArticlePersistenceError = (error: unknown): never => {
  if (error instanceof DomainException) {
    throw error;
  }

  if (error instanceof EntityNotFoundError) {
    throw new ArticleNotFoundException();
  }

  throw new InternalException(error);
};
