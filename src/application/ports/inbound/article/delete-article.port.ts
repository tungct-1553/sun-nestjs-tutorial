import { DeleteArticleCommand } from '@application/ports/inbound/article/article.types';

export interface DeleteArticlePort {
  execute(command: DeleteArticleCommand): Promise<void>;
}