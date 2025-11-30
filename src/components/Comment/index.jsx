import Image from "next/image";
import styles from "./comment.module.css";
import { DEFAULT_AVATAR_URL } from "../../constants";

export const Comment = ({ comment }) => {
  // ✅ SEMPRE usar avatar padrão (não confiar em dados do banco)
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
      <p>{comment.text}</p>
      <time>{new Date(comment.createdAt).toLocaleString()}</time>
    </div>
  );
};
