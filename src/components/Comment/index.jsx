import Image from "next/image";
import ReactMarkdown from "react-markdown";
import styles from "./comment.module.css";
import { DEFAULT_AVATAR_URL } from "../../constants";

export const Comment = ({ comment }) => {
  const avatarUrl = DEFAULT_AVATAR_URL;

  return (
    <div className={styles.comment}>
      <Image
        src={avatarUrl}
        width={32}
        height={32}
        alt={`Avatar do(a) ${comment.author?.name || "Usuário"}`}
      />
      <strong>@{comment.author?.name || "Anônimo"}</strong>

      {/* 
        ReactMarkdown: converte Markdown → HTML de forma segura
        
        O usuário escreve usando sintaxe Markdown no comentário:
          - **texto** vira <strong>texto</strong>
          - *texto* vira <em>texto</em>
          - [link](url) vira <a href="url">link</a>
        
        allowedElements: whitelist de tags HTML permitidas
        - Só renderiza as tags listadas aqui
        - Se o Markdown gerar outras tags (ex: <h1>, <img>), são bloqueadas
        - Se alguém tentar injetar <script>, <iframe>, etc., são bloqueados
        - É uma camada de proteção contra XSS
        
        Por que não processar HTML direto?
        - Se o usuário escrever <strong>texto</strong>, aparece como texto puro
        - Isso é proposital! HTML direto é perigoso (XSS)
        - Use **texto** (Markdown) ao invés de <strong> (HTML)
      */}
      <div className={styles.text}>
        <ReactMarkdown
          allowedElements={[
            "p",
            "strong",
            "em",
            "a",
            "ul",
            "ol",
            "li",
            "code",
            "br",
          ]}
        >
          {comment.text}
        </ReactMarkdown>
      </div>

      <time>{new Date(comment.createdAt).toLocaleString()}</time>
    </div>
  );
};
