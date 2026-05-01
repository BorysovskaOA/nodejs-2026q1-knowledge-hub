import { AnalyzeTask } from '../models/constants';

const getTaskInstructions = (task: AnalyzeTask) => {
  switch (task) {
    case AnalyzeTask.review: {
      return [];
    }
    case AnalyzeTask.bugs: {
      return [];
    }
    case AnalyzeTask.explain: {
      return [];
    }
    case AnalyzeTask.optimaze: {
      return [];
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
- Analyze article provided in INPUT_TEXT.
- ${getTaskInstructions(task).join('\n- ')}
[CONSTRAINTS]

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
        type: 'enum',
        enum: ['info', 'warning', 'error'],
        description: 'General severity level',
      },
    },
    required: ['analysis', 'suggestions'],
  };
};
