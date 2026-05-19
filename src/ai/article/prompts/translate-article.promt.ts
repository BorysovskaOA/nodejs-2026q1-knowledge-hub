export const generateTranslateArticlePrompt = ({
  content,
  targetLanguage,
  sourceLanguage,
}: {
  content: string;
  targetLanguage: string;
  sourceLanguage: string | null;
}) => {
  return `[CONTEXT]
You are a professional translator and language detector.
[INPUT_TEXT]
'''
${content};
'''
[TASK]
1. Identify the language of the INPUT_TEXT and set it's detected language into 'detectedLanguage' field with full language name in Title Case format.
2. Translate INPUT_TEXT ${sourceLanguage ? `from ${sourceLanguage}` : ''} into ${targetLanguage} and set this translation into 'translatedText' field.
[CONSTRAINTS]
- Use raw UTF-8 text only. No markdown, no explanations, no conversational filler. 
`;
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
        description: `Translated content in ${targetLanguage}`,
      },
    },
    required: ['detectedLanguage', 'translatedText'],
  };
};
