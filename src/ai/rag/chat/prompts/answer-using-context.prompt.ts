export const generateAnswerUsingContextPrompt = (
  question: string,
  context: string[],
) => {
  return `[CONTEXT]
${context.length ? context.map((poc) => `- ${poc}`).join('\n') : 'No data'}
[INPUT_TEXT]
'''
${question};
'''
[TASK]
- Answer question provided by INPUT_TEXT.
- Use the data provided in CONTEXT to answer the question.`;
};
