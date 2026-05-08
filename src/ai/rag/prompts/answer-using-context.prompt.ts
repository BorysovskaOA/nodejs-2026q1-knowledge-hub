export const generateAnswerUsingContextPrompt = (
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
- Answer question provided by INPUT_TEXT.
${context.length > 0 ? '- Use the data provided in CONTEXT to answer the question.' : ''}`;
};
