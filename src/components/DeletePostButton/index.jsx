"use client";

import { useState } from "react";
import { deletePost } from "../../actions/posts";
import { useRouter } from "next/navigation";
import styles from "./deletepostbutton.module.css";

/**
 * ⚠️ VULNERÁVEL A CSRF
 * 
 * Este componente permite deletar posts sem:
 * - Token CSRF
 * - Verificação de role
 * - Verificação de ownership
 * 
 * Durante o curso vamos adicionar todas essas proteções!
 */
export function DeletePostButton({ postId }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    // ⚠️ VULNERÁVEL: Sem token CSRF
    const result = await deletePost(postId);

    if (result.success) {
      alert("Post deletado com sucesso!");
      router.push("/");
    } else {
      alert(`Erro: ${result.error}`);
      setLoading(false);
    }
  };

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className={styles.deleteButton}
      >
        🗑️ Deletar Post
      </button>
    );
  }

  return (
    <div className={styles.confirmContainer}>
      <p className={styles.confirmText}>Tem certeza?</p>
      <div className={styles.buttonGroup}>
        <button
          onClick={handleDelete}
          disabled={loading}
          className={styles.confirmButton}
        >
          {loading ? "Deletando..." : "Sim, deletar"}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className={styles.cancelButton}
        >
          Cancelar
        </button>
      </div>
      <div className={styles.warningBadge}>⚠️ CSRF Vulnerable</div>
    </div>
  );
}

