export interface TokenServicePort {
  sign(userId: string): string;
}
