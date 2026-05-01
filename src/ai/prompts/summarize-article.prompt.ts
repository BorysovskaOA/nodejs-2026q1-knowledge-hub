import { SummarizeLength } from '../models/constants';

const getLengthInstruction = (summaryLength: SummarizeLength) => {
  switch (summaryLength) {
    case SummarizeLength.short: {
      return `Summary should be 2-3 sentence headline`;
    }
    case SummarizeLength.medium: {
      return `Summary should be 6-7 sentence description`;
    }
    case SummarizeLength.detailed: {
      return `Summary should be 10-15 sentence description of the article with key takeaways`;
    }
  }
};

export const generateSummarizeArticlePrompt = ({
  content,
  summaryLength,
}: {
  content: string;
  summaryLength: SummarizeLength;
}) => {
  return `You are a 1-response API and specialized text processor. 
  Explain the main message of the article like a journalist.
  Use your own words.
  Do not copy sentences directly from the text.
  ${getLengthInstruction(summaryLength)}
  Article content: |${content}|}`;
};
