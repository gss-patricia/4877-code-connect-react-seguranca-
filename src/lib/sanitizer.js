/**
 * 🔒 SANITIZADOR DE HTML - Server-side (sem dependências externas)
 *
 * Versão que funciona em QUALQUER ambiente (Vercel, AWS, etc)
 * SEM jsdom, SEM DOMPurify - apenas JavaScript puro
 *
 * ✅ Funciona na Vercel
 * ✅ Sem problemas de ESM/CommonJS
 * ✅ Leve e rápido
 */

const SANITIZE_CONFIGS = {
    // Para texto puro (comentários, respostas) - Remove todo HTML
    text: {
        allowedTags: [],
        stripAll: true,
    },

    // Para texto richtext (bios, descrições) - permite formatação básica
    rich: {
        allowedTags: ["p", "strong", "br", "em", "ul", "li", "ol", "i"],
        stripAll: false,
    },
};

/**
 * Remove tags HTML perigosas e scripts
 *
 * @param {string} html - HTML a ser sanitizado
 * @param {string} type - Tipo de sanitização ('text' ou 'rich')
 * @returns {string} - HTML sanitizado
 */
export function sanitizeHTML(html, type = "text") {
    if (!html || typeof html !== "string") return "";

    const config = SANITIZE_CONFIGS[type] || SANITIZE_CONFIGS.text;

    // Se for tipo 'text', remover TODAS as tags HTML
    if (config.stripAll) {
        return stripAllHTML(html);
    }

    // Se for tipo 'rich', permitir apenas tags seguras
    return stripUnsafeHTML(html, config.allowedTags);
}

/**
 * Remove TODAS as tags HTML (para comentários, texto puro)
 *
 * @param {string} html - HTML a ser sanitizado
 * @returns {string} - Texto sem HTML
 */
function stripAllHTML(html) {
    // Primeiro, remover tags perigosas COM CONTEÚDO
    let cleaned = html
        // Scripts (remover tag E conteúdo)
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        // Styles (remover tag E conteúdo)
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        // Comments HTML
        .replace(/<!--[\s\S]*?-->/g, "");

    // Depois, remover todas as outras tags (mas manter conteúdo)
    cleaned = cleaned
        .replace(/<[^>]*>/g, "")
        // Decodificar entidades HTML comuns
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&")
        // Trim espaços
        .trim();

    return cleaned;
}

/**
 * Remove tags HTML não permitidas e atributos perigosos
 *
 * @param {string} html - HTML a ser sanitizado
 * @param {Array<string>} allowedTags - Tags permitidas
 * @returns {string} - HTML sanitizado
 */
function stripUnsafeHTML(html, allowedTags) {
    // 1. Remover scripts e tags perigosas COMPLETAMENTE
    let cleaned = html
        // Scripts (incluindo conteúdo)
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        // Iframes
        .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
        // Objects
        .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
        // Embeds
        .replace(/<embed[^>]*>/gi, "")
        // Links (stylesheet, prefetch, etc)
        .replace(/<link[^>]*>/gi, "")
        // Styles
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
        // Meta tags
        .replace(/<meta[^>]*>/gi, "")
        // Base tag
        .replace(/<base[^>]*>/gi, "");

    // 2. Remover TODOS os event handlers (onclick, onerror, onload, etc)
    cleaned = cleaned.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
    cleaned = cleaned.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, "");

    // 3. Remover atributos javascript:
    cleaned = cleaned.replace(/javascript:/gi, "");

    // 4. Remover data: URIs (podem conter javascript)
    cleaned = cleaned.replace(/\s*data\s*:\s*text\/html[^"']*/gi, "");

    // Se não há tags permitidas, remover tudo
    if (!allowedTags || allowedTags.length === 0) {
        return stripAllHTML(cleaned);
    }

    // 5. Remover tags não permitidas
    // Criar regex que captura tags que NÃO estão na lista de permitidas
    const allowedPattern = allowedTags.join("|");

    // Regex para encontrar tags de abertura e fechamento não permitidas
    const tagRegex = new RegExp(
        `<\\/?(?!(?:${allowedPattern})(?:\\s|>|\\/|$))[^>]*>`,
        "gi"
    );

    cleaned = cleaned.replace(tagRegex, "");

    // 6. Remover TODOS os atributos de TODAS as tags
    // (mesmo das permitidas, por segurança)
    cleaned = cleaned.replace(/<(\w+)[^>]*>/gi, "<$1>");

    // 7. Trim e remover espaços múltiplos
    cleaned = cleaned.replace(/\s+/g, " ").trim();

    return cleaned;
}