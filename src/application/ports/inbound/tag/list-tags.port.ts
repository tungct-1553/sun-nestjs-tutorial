export interface ListTagsPort {
  execute(): Promise<string[]>;
}
