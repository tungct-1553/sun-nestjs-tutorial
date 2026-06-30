import { DuplicateEmailException } from '@domain/exceptions/duplicate-email.exception';
import { DuplicateUsernameException } from '@domain/exceptions/duplicate-username.exception';
import { InternalException } from '@domain/exceptions/internal.exception';
import { UserNotFoundException } from '@domain/exceptions/user-not-found.exception';
import { mapUserPersistenceError } from '@infrastructure/database/errors/database-error.mapper';
import { EntityNotFoundError, QueryFailedError } from 'typeorm';

const createUniqueViolation = (
  constraint: string,
  detail: string,
): QueryFailedError =>
  new QueryFailedError('INSERT', [], {
    code: '23505',
    constraint,
    detail,
  } as Error);

describe('mapUserPersistenceError', () => {
  it('maps entity not found to UserNotFoundException', () => {
    expect(() =>
      mapUserPersistenceError(new EntityNotFoundError('users', {})),
    ).toThrow(UserNotFoundException);
  });

  it('maps unique email constraint to DuplicateEmailException', () => {
    expect(() =>
      mapUserPersistenceError(
        createUniqueViolation(
          'UQ_users_email',
          'Key (email)=(jake@jake.jake) already exists.',
        ),
      ),
    ).toThrow(DuplicateEmailException);
  });

  it('maps unique username constraint to DuplicateUsernameException', () => {
    expect(() =>
      mapUserPersistenceError(
        createUniqueViolation(
          'UQ_users_username',
          'Key (username)=(jake) already exists.',
        ),
      ),
    ).toThrow(DuplicateUsernameException);
  });

  it('wraps unknown framework errors in InternalException', () => {
    const error = new Error('connection refused');

    expect(() => mapUserPersistenceError(error)).toThrow(InternalException);

    try {
      mapUserPersistenceError(error);
    } catch (caught) {
      expect(caught).toBeInstanceOf(InternalException);
      expect((caught as InternalException).cause).toBe(error);
    }
  });

  it('wraps unmapped unique violations in InternalException', () => {
    const error = createUniqueViolation(
      'UQ_other_table_column',
      'Key (other)=(value) already exists.',
    );

    expect(() => mapUserPersistenceError(error)).toThrow(InternalException);

    try {
      mapUserPersistenceError(error);
    } catch (caught) {
      expect(caught).toBeInstanceOf(InternalException);
      expect((caught as InternalException).cause).toBe(error);
    }
  });

  it('rethrows existing domain exceptions unchanged', () => {
    const error = new DuplicateEmailException();

    expect(() => mapUserPersistenceError(error)).toThrow(error);
  });
});
