/**
 * Converts a JSON value to an array of strings
 *
 * @param jsonValue The JSON value to convert
 */
export const jsonValueToArray = (jsonValue: unknown) =>
  Array.isArray(jsonValue)
    ? jsonValue.filter<string>((value): value is string => typeof value === 'string')
    : [];
