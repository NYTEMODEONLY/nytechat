import DOMPurify from 'isomorphic-dompurify';

/**
 * Safely parse only the links in markdown text to clickable HTML links
 * @param text The markdown text to parse
 * @returns Text with clickable links but otherwise unchanged
 */
export const parseMarkdown = (text: string): string => {
  // Match markdown links: [text](url)
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  
  // Replace only the links with HTML anchor tags
  const htmlWithLinks = text.replace(linkRegex, (match, linkText, url) => {
    // Create a safe URL
    const safeUrl = DOMPurify.sanitize(url);
    
    // Return an HTML anchor tag
    return `<a href="${safeUrl}" target="_blank" rel="noopener noreferrer">${linkText}</a>`;
  });
  
  return htmlWithLinks;
};

/**
 * Parse markdown but exclude code blocks which will be handled separately
 * @param content Markdown content with or without code blocks
 * @returns Array of parts (text or code blocks)
 */
export const parseMessageContent = (content: string) => {
  // Match triple backtick code blocks
  const codeBlockRegex = /```(?:(\w+)\n)?([\s\S]*?)```/g;
  const parts: Array<{ type: 'text' | 'code'; content: string; language?: string }> = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null = null;

  // Parse each code block and text segment
  let execResult = codeBlockRegex.exec(content);
  while (execResult !== null) {
    match = execResult;
    
    // Add text before the code block
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex, match.index)
      });
    }

    // Add the code block with proper type handling
    parts.push({
      type: 'code',
      language: typeof match[1] === 'string' ? match[1] : '',
      content: match[2]
    });

    lastIndex = match.index + match[0].length;
    execResult = codeBlockRegex.exec(content);
  }

  // Add any remaining text after the last code block
  if (lastIndex < content.length) {
    parts.push({
      type: 'text',
      content: content.substring(lastIndex)
    });
  }

  return parts.length > 0 ? parts : [{ type: 'text', content }];
}; 