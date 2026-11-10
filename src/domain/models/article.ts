export interface ArticleAuthorProps {
  username: string;
  bio: string | null;
  image: string | null;
  following?: boolean;
}

export interface ArticleProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  body: string;
  authorId: string;
  author: ArticleAuthorProps;
  tagList: string[];
  createdAt: Date;
  updatedAt: Date;
  favorited?: boolean;
  favoritesCount?: number;
}

export class Article {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly body: string;
  readonly authorId: string;
  readonly author: ArticleAuthorProps;
  readonly tagList: string[];
  readonly createdAt: Date;
  readonly updatedAt: Date;
  readonly favorited: boolean;
  readonly favoritesCount: number;

  constructor(props: ArticleProps) {
    this.id = props.id;
    this.slug = props.slug;
    this.title = props.title;
    this.description = props.description;
    this.body = props.body;
    this.authorId = props.authorId;
    this.author = props.author;
    this.tagList = props.tagList;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.favorited = props.favorited ?? false;
    this.favoritesCount = props.favoritesCount ?? 0;
  }
}
