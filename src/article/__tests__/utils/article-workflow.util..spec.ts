import { ArticleStatus } from '@prisma/client';
import { ArticleWorkflow } from 'src/article/utils/article-workflow.util';
import { describe, it, expect } from 'vitest';

describe('Article Workflow', () => {
  it("allows transition from 'draft' to 'published'", () => {
    const result = ArticleWorkflow.canTransition(
      ArticleStatus.draft,
      ArticleStatus.published,
    );

    expect(result).toBeTruthy();
  });

  it("allows transition from 'draft' to 'archived'", () => {
    const result = ArticleWorkflow.canTransition(
      ArticleStatus.draft,
      ArticleStatus.archived,
    );

    expect(result).toBeTruthy();
  });

  it("allows transition from 'published' to 'archived'", () => {
    const result = ArticleWorkflow.canTransition(
      ArticleStatus.published,
      ArticleStatus.archived,
    );

    expect(result).toBeTruthy();
  });

  it("does not allow transition from 'published' to 'draft'", () => {
    const result = ArticleWorkflow.canTransition(
      ArticleStatus.published,
      ArticleStatus.draft,
    );

    expect(result).toBeFalsy();
  });

  it("does not allow transition from 'archived' to 'draft'", () => {
    const result = ArticleWorkflow.canTransition(
      ArticleStatus.archived,
      ArticleStatus.draft,
    );

    expect(result).toBeFalsy();
  });

  it("does not allow transition from 'archived' to 'published'", () => {
    const result = ArticleWorkflow.canTransition(
      ArticleStatus.archived,
      ArticleStatus.published,
    );

    expect(result).toBeFalsy();
  });

  it("does not allow transition from 'archived' to 'other'", () => {
    const result = ArticleWorkflow.canTransition(
      ArticleStatus.archived,
      'other' as any,
    );

    expect(result).toBeFalsy();
  });

  it("does not allow transition from 'other' to 'draft'", () => {
    const result = ArticleWorkflow.canTransition(
      'other' as any,
      ArticleStatus.draft,
    );

    expect(result).toBeFalsy();
  });
});
