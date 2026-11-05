export interface Comment {
  id: string;
  articleId: string;
  authorId: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
  author: { username: string; bio: string | null; image: string | null };
}
