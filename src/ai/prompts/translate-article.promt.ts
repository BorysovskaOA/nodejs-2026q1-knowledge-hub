export const generateTranslateArticlePrompt = ({
  content,
  targetLanguage,
  sourceLanguage,
}: {
  content: string;
  targetLanguage: string;
  sourceLanguage: string | null;
}) => {
  return `[TASK]
1. ${sourceLanguage ? `The source language is ${sourceLanguage}. ` : ''} Identify the language of the INPUT_TEXT and set it's detected language into 'detectedLanguage' field with full language name in Title Case format.
2. Translate INPUT_TEXT into ${targetLanguage} and set translation into 'translatedText' field.
[CONSTRAINTS]
- No markdown, no explanations. Use raw UTF-8 text.
[INPUT_TEXT]
${content}`;
};

export const getTranslateArticleResponseSchema = (targetLanguage: string) => {
  return {
    type: 'object',
    properties: {
      detectedLanguage: {
        type: 'string',
        description: 'Detected language name in Title Case',
      },
      translatedText: {
        type: 'string',
        description: `Tranlsated content in  ${targetLanguage}`,
      },
    },
    required: ['detectedLanguage', 'translatedText'],
  };
};
