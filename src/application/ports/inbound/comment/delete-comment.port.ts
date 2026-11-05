export interface DeleteCommentPort {
  execute(slug: string, id: string, authorId: string): Promise<void>;
}
