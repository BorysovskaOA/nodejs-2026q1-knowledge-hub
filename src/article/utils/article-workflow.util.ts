import { ArticleStatus } from '@prisma/client';

export const ArticleWorkflow = {
  transitions: {
    [ArticleStatus.draft]: [ArticleStatus.published, ArticleStatus.archived],
    [ArticleStatus.published]: [ArticleStatus.archived],
    [ArticleStatus.archived]: [],
  },

  canTransition(current: ArticleStatus, next: ArticleStatus) {
    return this.transitions[current]?.includes(next) || false;
  },
};
