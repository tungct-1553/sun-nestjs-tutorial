export interface ArticleAuthorProps {
  username: string;
  bio: string | null;
  image: string | null;
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
  }
}