import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
// utils/formatZendalonaList.js
export async function formatMarkdownAutoList(rawText) {
  // Get intro before first known product
  const introMatch = rawText.match(/^(.*?)(?=Accessible-Coconut:)/s);
  const intro = introMatch ? introMatch[1].trim() : '';

  // Match product entries: "Product Name: Description"
  const pattern = /([A-Z][^:\n]+):\s+([^*]+)/g;
  const items = [];
  let match;

  while ((match = pattern.exec(rawText)) !== null) {
    const title = match[1].trim().replace(/\s+/g, ' ');
    const description = match[2].trim().replace(/\s+/g, ' ');
    items.push(`* **${title}**: ${description}`);
  }

  return `${intro ? intro + '\n\n' : ''}${items.join('\n')}`;
}

