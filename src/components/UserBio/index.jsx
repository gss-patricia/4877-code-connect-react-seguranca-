import ReactMarkdown from "react-markdown";
import styles from "./userbio.module.css";

export function UserBio({ bio }) {
  if (!bio) {
    return null;
  }

  return (
    <div className={styles.bioContainer}>
      <h3 className={styles.bioTitle}>Bio</h3>
      <div className={styles.bioContent}>
        {/* 
          ReactMarkdown: converte Markdown → HTML seguro
          
          A bio do usuário é escrita em Markdown e renderizada aqui:
          - **negrito** → <strong>negrito</strong>
          - *itálico* → <em>itálico</em>
          - [link](url) → <a href="url">link</a>
          - Listas, parágrafos, etc.
          
          allowedElements: proteção contra XSS
          - Só permite tags seguras (p, strong, em, a, ul, ol, li, code)
          - Bloqueia <script>, <iframe>, <img>, <style>, etc.
          - Defesa em profundidade: mesmo que Markdown gere tags maliciosas,
            elas são bloqueadas aqui
        */}
        <ReactMarkdown
          allowedElements={[
            "p",
            "strong",
            "em",
            "br",
            "a",
            "ul",
            "ol",
            "li",
            "code",
          ]}
        >
          {bio}
        </ReactMarkdown>
      </div>
    </div>
  );
}
