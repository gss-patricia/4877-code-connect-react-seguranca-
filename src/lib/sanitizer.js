import DOMPurify from "isomorphic-dompurify";

/**
 * ✅ ISOMORPHIC SANITIZER
 *
 * Usa isomorphic-dompurify que funciona tanto no servidor quanto no cliente.
 * Isso garante:
 * - Sem hydration mismatch (mesma sanitização em ambos os ambientes)
 * - Proteção em múltiplas camadas
 * - Compatibilidade com Server e Client Components
 */

/**
 * Configurações de sanitização para diferentes contextos
 */
const SANITIZE_CONFIGS = {
  // Para texto puro (comentários, respostas) - Remove TODO HTML
  text: {
    ALLOWED_TAGS: [], // ← Nenhuma tag permitida
    ALLOWED_ATTR: [], // ← Nenhum atributo
    ALLOW_DATA_ATTR: false,
    KEEP_CONTENT: true, // ← Mantém o conteúdo, só remove tags
  },

  // Para texto rico/formatado (bios, descrições) - Permite formatação básica
  rich: {
    ALLOWED_TAGS: ["p", "strong", "em", "br", "a", "ul", "ol", "li", "i"],
    ALLOWED_ATTR: ["href", "target", "rel"],
    ALLOW_DATA_ATTR: false,
  },

  // Para markdown de posts (permite mais tags de formatação)
  markdown: {
    ALLOWED_TAGS: [
      "p",
      "strong",
      "em",
      "br",
      "a",
      "ul",
      "ol",
      "li",
      "code",
      "pre",
      "h1",
      "h2",
      "h3",
      "h4",
      "i",
      "blockquote",
    ],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
    ALLOW_DATA_ATTR: false,
  },
};

/**
 * Sanitiza HTML usando DOMPurify
 * @param {string} html - HTML a ser sanitizado
 * @param {'text' | 'rich' | 'markdown'} type - Tipo de conteúdo (determina as regras)
 * @returns {string} HTML sanitizado
 */
export function sanitizeHTML(html, type = "text") {
  if (!html) return "";

  const config = SANITIZE_CONFIGS[type] || SANITIZE_CONFIGS.text;

  // ✅ isomorphic-dompurify funciona em ambos os ambientes
  return DOMPurify.sanitize(html, config);
}

/**
 * Sanitiza texto puro (remove TODO HTML)
 * @param {string} text - Texto a ser sanitizado
 * @returns {string} Texto sem HTML
 */
export function sanitizeText(text) {
  return sanitizeHTML(text, "text");
}

/**
 * Sanitiza texto rico/formatado (permite formatação básica)
 * Útil para bios, descrições, etc.
 * @param {string} html - HTML a ser sanitizado
 * @returns {string} HTML sanitizado com formatação básica
 */
export function sanitizeRich(html) {
  return sanitizeHTML(html, "rich");
}

/**
 * Sanitiza markdown de post
 * @param {string} markdown - Markdown a ser sanitizado
 * @returns {string} Markdown sanitizado
 */
export function sanitizeMarkdown(markdown) {
  return sanitizeHTML(markdown, "markdown");
}
