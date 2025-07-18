/**
 * Utility functions for processing text, especially AI responses
 */

/**
 * Decodes HTML entities in a string
 * @param text - The text containing HTML entities
 * @returns The decoded text
 */
export const decodeHtmlEntities = (text: string): string => {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
};

/**
 * Processes AI response text to make it more readable
 * @param text - The raw AI response text
 * @returns The processed text
 */
export const processAIResponse = (text: string): string => {
  if (!text) return text;

  // Decode HTML entities
  let processed = decodeHtmlEntities(text);

  // Replace common AI response patterns
  processed = processed
    // Remove excessive asterisks and formatting
    .replace(/\*{2,}/g, "")
    .replace(/\*blushes\*/g, "😊")
    .replace(/\*smiles\*/g, "😊")
    .replace(/\*laughs\*/g, "😄")
    .replace(/\*winks\*/g, "😉")
    .replace(/\*nods\*/g, "👍")
    .replace(/\*shrugs\*/g, "🤷")

    // Replace text emoticons with emoji
    .replace(/:\)/g, "😊")
    .replace(/:D/g, "😄")
    .replace(/;\)/g, "😉")
    .replace(/:\|/g, "😐")
    .replace(/:\//g, "😕")
    .replace(/:\(/g, "😕")
    .replace(/<3/g, "❤️")

    // Clean up excessive whitespace
    .replace(/\s+/g, " ")
    .trim();

  return processed;
};

/**
 * Checks if text contains HTML entities that need decoding
 * @param text - The text to check
 * @returns True if HTML entities are found
 */
export const hasHtmlEntities = (text: string): boolean => {
  return /&[a-zA-Z0-9#]+;/.test(text);
};

/**
 * Safely renders text content, processing it if needed
 * @param text - The text to render
 * @param isAIResponse - Whether this is an AI response that needs processing
 * @returns The processed text ready for rendering
 */
export const renderTextContent = (
  text: string,
  isAIResponse: boolean = false
): string => {
  if (!text) return text;

  if (isAIResponse) {
    return processAIResponse(text);
  }

  // For regular messages, just decode HTML entities if present
  if (hasHtmlEntities(text)) {
    return decodeHtmlEntities(text);
  }

  return text;
};
