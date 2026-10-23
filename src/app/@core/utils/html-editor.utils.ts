export const MAX_RICH_TEXT_LENGTH = 100_000;

const ALLOWED_TAGS = new Set<string>([
  'P', 'BR', 'DIV', 'SPAN', 'STRONG', 'B', 'EM', 'I', 'U', 'S',
  'UL', 'OL', 'LI', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'CAPTION', 'TR', 'TD', 'TH',
  'BLOCKQUOTE', 'PRE', 'CODE', 'HR', 'SUP', 'SUB'
]);

// Etiquetas que se eliminan junto con su contenido (peligrosas o sin sentido en el PDF).
const DROP_CONTENT_TAGS = new Set<string>([
  'SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'FORM', 'INPUT', 'TEXTAREA',
  'SELECT', 'OPTION', 'BUTTON', 'META', 'LINK', 'SVG', 'MATH', 'VIDEO', 'AUDIO',
  'SOURCE', 'CANVAS', 'NOSCRIPT', 'TEMPLATE'
]);

// En esta iteración no se admiten imágenes en el contenido; los enlaces se
// desenvuelven (se conserva su texto) porque los hrefs quedan fuera de alcance.
const REMOVE_SELF_TAGS = new Set<string>(['IMG']);

function sanitizeStyle(value: string): string {
  const match = /text-align\s*:\s*(left|center|right|justify)/i.exec(value || '');
  return match ? `text-align: ${match[1].toLowerCase()}` : '';
}

function sanitizeElement(element: Element): void {
  Array.from(element.childNodes).forEach((child) => {
    if (child.nodeType === Node.COMMENT_NODE) {
      child.parentNode?.removeChild(child);
      return;
    }
    if (child.nodeType === Node.ELEMENT_NODE) {
      sanitizeElement(child as Element);
    }
  });

  const tag = element.tagName;
  if (DROP_CONTENT_TAGS.has(tag) || REMOVE_SELF_TAGS.has(tag)) {
    element.parentNode?.removeChild(element);
    return;
  }

  if (!ALLOWED_TAGS.has(tag)) {
    const parent = element.parentNode;
    if (!parent) {
      return;
    }
    while (element.firstChild) {
      parent.insertBefore(element.firstChild, element);
    }
    parent.removeChild(element);
    return;
  }

  Array.from(element.attributes).forEach((attr) => {
    const name = attr.name.toLowerCase();
    if (name === 'style') {
      const clean = sanitizeStyle(attr.value);
      if (clean) {
        element.setAttribute('style', clean);
      } else {
        element.removeAttribute('style');
      }
      return;
    }
    if ((tag === 'TD' || tag === 'TH') && (name === 'colspan' || name === 'rowspan')) {
      const value = Number.parseInt(attr.value, 10);
      if (Number.isFinite(value) && value > 1 && value <= 1000) {
        element.setAttribute(name, String(value));
      } else {
        element.removeAttribute(name);
      }
      return;
    }
    element.removeAttribute(attr.name);
  });
}

export function sanitizeRichText(html: string): string {
  if (!html) {
    return '';
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  Array.from(doc.body.childNodes).forEach((child) => {
    if (child.nodeType === Node.COMMENT_NODE) {
      child.parentNode?.removeChild(child);
      return;
    }
    if (child.nodeType === Node.ELEMENT_NODE) {
      sanitizeElement(child as Element);
    }
  });
  return doc.body.innerHTML;
}

export function htmlToText(html: string): string {
  if (!html) {
    return '';
  }
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return (doc.body.textContent || '')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function isProbablyHtml(value: string): boolean {
  return /<\/?[a-z][\s\S]*>/i.test(value || '');
}

export function escapeHtml(value: string): string {
  return (value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function plainTextToHtml(value: string): string {
  const lines = (value || '').replace(/\r\n?/g, '\n').split('\n');
  return lines
    .map((line) => (line ? `<p>${escapeHtml(line)}</p>` : '<p><br></p>'))
    .join('');
}

export function toEditorHtml(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  return isProbablyHtml(value) ? sanitizeRichText(value) : plainTextToHtml(value);
}

export function normalizeRichTextValue(value: string | null | undefined): string {
  const clean = sanitizeRichText(value || '');
  return htmlToText(clean) ? clean : '';
}
