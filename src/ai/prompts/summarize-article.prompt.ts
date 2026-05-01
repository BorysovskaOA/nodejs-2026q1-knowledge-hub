import { SummarizeLength } from '../models/constants';

const getLengthInstructions = (summaryLength: SummarizeLength) => {
  switch (summaryLength) {
    case SummarizeLength.short: {
      return [
        'Summary must consist of 1-2 sentence.',
        'Summary must cover only the primary conclusion or purpose of the text.',
      ];
    }
    case SummarizeLength.medium: {
      return [
        'Summary must be a concise summary in one paragraph (approx. 4-5 sentences).',
        'Summary must include the main thesis and 3 most important supporting points.',
        'Summary must be based on major points, avoid minor details.',
      ];
    }
    case SummarizeLength.detailed: {
      return [
        'Summary must be a detailed multi-paragraph summary.',
        'Summary must cover the introduction, all major arguments or sections, and the final conclusion.',
        'Summary must include key data points or specific examples mentioned in the text.',
      ];
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
  return `[TASK]
- Write summary for INPUT_TEXT.
- ${getLengthInstructions(summaryLength).join('\n- ')}
[CONSTRAINTS]
- Do not copy sentences directly from the text. 
- Do not include conversational text.
- Do not include any summary description, pre or post text.
[INPUT_TEXT]
${content}`;
};
