export const generateReformatQuestionPrompt = (question: string) => {
  return `[INPUT_TEXT]
'''
${question};
'''
[TASK]
- Reformat INPUT_TEXT using context from previous messages so it would include all details.
[CONSTRAINTS]
- Do not include conversational text.`;
};
