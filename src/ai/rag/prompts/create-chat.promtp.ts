export const generateCreateConversationPrompt = (
  question: string,
  context: string[],
) => {
  return `${
    context.length > 0
      ? `
[CONTEXT]
${context.map((poc) => `- ${poc}`).join('\n')}`
      : ''
  }
[INPUT_TEXT]
'''
${question};
'''
[TASK]
- Generate title (up to 10 words) of the conversation based on INPUT_TEXT and place it into 'title' field.
- Answer question provided by INPUT_TEXT and place it into 'answer' field.
${context.length > 0 ? '- Use the data provided in CONTEXT to answer the question.' : ''}`;
};

export const getCreateConversationResponseSchema = () => {
  return {
    type: 'object',
    properties: {
      title: {
        type: 'title',
        description: 'Title of the conversation',
      },
      answer: {
        type: 'string',
        description: `Generated answer`,
      },
    },
    required: ['title', 'content'],
  };
};
