export interface TagRepositoryPort {
  findAll(): Promise<string[]>;
}
