/**
 * Secure Markdown to HTML parser with anchor IDs, responsive tables, and XSS sanitization.
 */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * XSS Sanitizer to strip dangerous tags, event handlers, and javascript: URIs.
 */
export function sanitizeHtml(html: string): string {
  let sanitized = html
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove iframe tags and content
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    // Remove object/embed tags
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    // Remove inline event handlers (e.g. onclick, onerror, onload)
    .replace(/\s+on[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    // Remove javascript: URIs
    .replace(/href\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, 'href="#"');

  return sanitized;
}

export function parseMarkdownToHtml(markdown: string): string {
  if (!markdown) return '';

  let normalized = (markdown || '')
    .replace(/\\+r\\+n/g, '\n')
    .replace(/\\+n/g, '\n')
    .replace(/\\+r/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  while (normalized.includes('\\n') || normalized.includes('\\r')) {
    normalized = normalized.replace(/\\+n/g, '\n').replace(/\\+r/g, '\n');
  }

  const lines = normalized.split('\n');
  const result: string[] = [];
  let inList = false;
  let inTable = false;
  let tableHeaderDone = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();

    // Close list if line is not a list item
    if (inList && !line.startsWith('* ') && !line.startsWith('- ') && !/^\d+\.\s/.test(line)) {
      result.push('</ul>');
      inList = false;
    }

    // Table parsing
    if (line.startsWith('|') && line.endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableHeaderDone = false;
        result.push('<div class="seo-table-wrapper"><table class="seo-table">');
      }

      // Check if separator line e.g. |---|---|
      if (line.replace(/[\s|:-]/g, '').length === 0) {
        tableHeaderDone = true;
        result.push('</thead><tbody>');
        continue;
      }

      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      if (!tableHeaderDone) {
        result.push('<thead><tr>');
        cells.forEach(cell => {
          result.push(`<th>${formatInlineMarkdown(cell)}</th>`);
        });
        result.push('</tr>');
      } else {
        result.push('<tr>');
        cells.forEach(cell => {
          result.push(`<td>${formatInlineMarkdown(cell)}</td>`);
        });
        result.push('</tr>');
      }
      continue;
    } else if (inTable) {
      inTable = false;
      result.push('</tbody></table></div>');
    }

    // Headings
    if (line.startsWith('# ')) {
      const text = line.substring(2).trim();
      result.push(`<h1 id="${slugify(text)}">${formatInlineMarkdown(text)}</h1>`);
      continue;
    }
    if (line.startsWith('## ') && !line.startsWith('### ')) {
      const text = line.substring(3).trim();
      result.push(`<h2 id="${slugify(text)}">${formatInlineMarkdown(text)}</h2>`);
      continue;
    }
    if (line.startsWith('### ')) {
      const text = line.substring(4).trim();
      result.push(`<h3 id="${slugify(text)}">${formatInlineMarkdown(text)}</h3>`);
      continue;
    }
    if (line.startsWith('#### ')) {
      const text = line.substring(5).trim();
      result.push(`<h4 id="${slugify(text)}">${formatInlineMarkdown(text)}</h4>`);
      continue;
    }

    // Blockquote
    if (line.startsWith('> ')) {
      const text = line.substring(2).trim();
      result.push(`<blockquote>${formatInlineMarkdown(text)}</blockquote>`);
      continue;
    }

    // Unordered List
    if (line.startsWith('* ') || line.startsWith('- ')) {
      if (!inList) {
        inList = true;
        result.push('<ul>');
      }
      const text = line.substring(2).trim();
      result.push(`<li>${formatInlineMarkdown(text)}</li>`);
      continue;
    }

    // Empty line
    if (line === '') {
      continue;
    }

    // Paragraph
    result.push(`<p>${formatInlineMarkdown(line)}</p>`);
  }

  if (inList) {
    result.push('</ul>');
  }
  if (inTable) {
    result.push('</tbody></table></div>');
  }

  const rawHtml = result.join('\n');
  return sanitizeHtml(rawHtml);
}

function formatInlineMarkdown(text: string): string {
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Links [Text](URL)
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}
