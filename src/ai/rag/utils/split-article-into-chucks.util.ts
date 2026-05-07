export const splitArticleIntoChunks = (
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
