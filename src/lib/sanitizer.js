import DOMPurify from "isomorphic-dompurify"

const SANITIZE_CONFIGS = {
    // Para texto puro (comentários, respostas) - Remove todo HTML
    text: {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
        ALLOWED_DATA_ATTR: false,
        KEEP_CONTENT: true
    },

    // Para texto richtext (bios, descrições) - permite formatação básica
    rich: {
        ALLOWED_TAGS: ["p", "strong", "br", "em", "ul", "li", "ol", "i"],
        ALLOWED_ATTR: [],
        ALLOWED_DATA_ATTR: false,
    }
}

export function sanitizeHTML(html, type = "text") {
    if (!html) return ""

    const config = SANITIZE_CONFIGS[type] || SANITIZE_CONFIGS.text

    return DOMPurify.sanitize(html, config)
}