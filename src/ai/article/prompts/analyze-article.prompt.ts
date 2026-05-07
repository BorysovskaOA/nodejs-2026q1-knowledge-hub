import { AnalyzeTask } from '../article/models/constants';

const getTaskInstructions = (task: AnalyzeTask) => {
  switch (task) {
    case AnalyzeTask.review: {
      return [
        "Evaluate the article's flow, tone, and readability.",
        'Check if the arguments are persuasive and well - structured.',
      ];
    }
    case AnalyzeTask.bugs: {
      return [
        'Identify factual inconsistencies, logical fallacies, grammatical errors, or missing context in the text.',
      ];
    }
    case AnalyzeTask.explain: {
      return [
        "Break down the article's complex concepts into simple summaries for a general audience.",
      ];
    }
    case AnalyzeTask.optimaze: {
      return [
        'Suggest improvements to make the article more engaging, concise, or impactful for the reader.',
      ];
    }
  }
};

export const generateAnalizeArticlePrompt = ({
  content,
  task,
}: {
  content: string;
  task: AnalyzeTask;
}) => {
  return `[TASK]
- Provide detailed analysis of the content of INPUT_TEXT and put it in 'analysis' field.
- Provide a list of suggestions to improve the article and put them in 'suggestions' field.
- Calculate a severity based on the findings and place it as single word to 'severity' field.
- Severity should one of (info, warning, error) and be based on it's description:
   -- info: minor stylistic suggestions or everything is good.
   -- warning: clarity issues or weak arguments.
   -- error: factual errors, logical gaps, or severe tone issues.

- ${getTaskInstructions(task).join('\n- ')}
[CONSTRAINTS]
- Use raw UTF-8 text.
- No markdown, no explanations. 
[INPUT_TEXT]
${content}`;
};

export const getAnalyzeArticleResponseSchema = () => {
  return {
    type: 'object',
    properties: {
      analysis: {
        type: 'string',
        description: 'General analysis description',
      },
      suggestions: {
        type: 'array',
        description: 'Recommended suggesstions',
        items: {
          type: 'string',
          description: 'Each individual suggestion item',
        },
      },
      severity: {
        type: 'string',
        enum: ['info', 'warning', 'error'],
        description: 'General severity level',
      },
    },
    required: ['analysis', 'suggestions'],
  };
};
