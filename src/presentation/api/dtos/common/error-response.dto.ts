export class ErrorResponseDto {
  errors: Record<string, string[]>;

  constructor(errors: Record<string, string[]>) {
    this.errors = errors;
  }
}
