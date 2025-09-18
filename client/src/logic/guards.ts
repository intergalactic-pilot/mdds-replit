// Forbidden words guard - replaces "game" and "operation" with "strategy"
export function sanitizeText(text: string): string {
  return text
    .replace(/\bgame\b/gi, 'strategy')
    .replace(/\boperation\b/gi, 'strategy');
}

// Runtime text sanitization for rendered content
export function sanitizeForDisplay(element: HTMLElement) {
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );

  const textNodes: Text[] = [];
  let node;
  
  while (node = walker.nextNode()) {
    textNodes.push(node as Text);
  }

  textNodes.forEach(textNode => {
    const originalText = textNode.textContent || '';
    const sanitizedText = sanitizeText(originalText);
    if (originalText !== sanitizedText) {
      textNode.textContent = sanitizedText;
    }
  });
}

// Build-time guard to check for forbidden words in static strings
export function validateNoForbiddenWords(content: string): boolean {
  const forbiddenPattern = /\b(game|operation)\b/gi;
  return !forbiddenPattern.test(content);
}