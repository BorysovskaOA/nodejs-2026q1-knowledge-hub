import { ArticleEntity } from 'src/article/models/article.entity';

const splitIntoChunks = (
  content: string,
  size: number,
  overlap: number,
): string[] => {
  const chunks: string[] = [];

  let start = 0;
  while (start < content.length) {
    const end = start + size;
    chunks.push(content.slice(start, end));

    start += size - overlap;

    if (start >= content.length - overlap && start < content.length) {
      chunks.push(content.slice(start));
      break;
    }
  }

  return chunks.filter((c) => c.trim().length > 0);
};

export const splitArticleInChunksWithPayload = (article: ArticleEntity) => {
  const chunks = splitIntoChunks(
    article.content,
    Number(process.env.RAG_CHUNK_SIZE as string),
    Number(process.env.RAG_CHUNK_OVERLAP as string),
  );

  return chunks.map((chunk, index) => ({
    articleId: article.id,
    title: article.title,
    status: article.status,
    categoryId: article.categoryId,
    tags: article.tags,
    content: chunk,
    chunkIndex: index,
  }));
};
