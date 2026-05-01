import { InternalServerError } from 'src/core/exceptions/app-errors';

export const getOutputFormatFromJsonSchema = (schema: any) => {
  const schemaProperties = schema.properties;

  const properties = Object.keys(schemaProperties);

  return `[OUTPUT_FORMAT]
${properties.map((p) => `${p}:|${schemaProperties[p].description}|`).join('\n')}`;
};

export const getJsonBySchemaFromOutput = (text: string, schema: any) => {
  const schemaProperties = schema.properties;

  const properties = Object.keys(schemaProperties);

  const splittedText = text.split('|');

  let formattingProperty: string;

  const result = {};

  splittedText.forEach((item, i) => {
    if (i % 2 === 0) {
      properties.forEach((p) => {
        if (item.includes(p)) {
          formattingProperty = p;
        }
      });
    } else {
      if (!formattingProperty) {
        throw new InternalServerError(
          {
            function: getJsonBySchemaFromOutput,
            parsingText: text,
            schema: schema,
          },
          "Couldn't format response from AI",
        );
      }
      result[formattingProperty] = item;
    }
  });

  return result;
};
