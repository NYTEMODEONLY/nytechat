/**
 * Ensure a value is a string, with a fallback to empty string
 * @param value The value to check
 * @returns The value as a string, or empty string if undefined/null
 */
export const ensureString = (value: unknown): string => {
  if (value === undefined || value === null) {
    return '';
  }
  return String(value);
}; 