import { Logger } from '@nestjs/common';

export const getOutputFormatFromJsonSchema = (schema: any) => {
  const schemaProperties = schema.properties;

  const properties = Object.keys(schemaProperties);

  return `[OUTPUT_FORMAT]
Use the following format exactly. Ensure each field starts with |||${Object.values(schema.properties).some((value: any) => value.type === 'array') ? ' and each list item starts with ***' : ''}.

${properties
  .map((p) => {
    switch (schemaProperties[p].type) {
      case 'string':
        return `|||${p}:${schemaProperties[p].description}`;
      case 'enum':
        return `|||${p}:${schemaProperties[p].description}, can be one of:${schemaProperties[p].enum.join(',')}`;
      case 'array':
        return `|||${p}:${schemaProperties[p].description}(Unordered list)\n${'***List property example\n***List other property example'}`;
    }
  })
  .join('\n')}`;
};

export const getJsonBySchemaFromOutput = (
  aiResponseText: string,
  schema: any,
) => {
  const logger = new Logger('AI_REAPONSE_PARSING');
  const schemaProperties = schema.properties;
  const properties = Object.keys(schemaProperties);
  const fields = aiResponseText.split('|||');
  const result = {};

  fields.forEach((field: string) => {
    const formattedField = field.trim();
    if (!formattedField) return;

    console.log(formattedField);
    const parts = formattedField.split(':');
    const propertyName = parts[0];
    const propertyValue = parts.slice(1).join(':');
    console.log(propertyName);
    console.log(propertyValue);

    const formattingProperty = properties.find((p) => propertyName === p);

    if (!formattingProperty) {
      logger.debug(
        {
          function: getJsonBySchemaFromOutput,
          aiResponseText,
          property: propertyName,
          schema: schema,
        },
        `Could not parse property in ${propertyName}`,
      );
      return;
    }

    if (schemaProperties[formattingProperty].type === 'array') {
      const listItemParts = propertyValue.split('***');
      const listItemsResult: string[] = [];

      listItemParts.forEach((liPart: string, i: number) => {
        if (i !== 0) {
          listItemsResult.push(liPart.trim());
        }
      });

      result[formattingProperty] = listItemsResult;
    } else {
      result[formattingProperty] = propertyValue;
    }
  });

  return result;
};
