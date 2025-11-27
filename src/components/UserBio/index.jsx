import styles from "./userbio.module.css";

/**
 * ⚠️ COMPONENTE VULNERÁVEL A XSS
 *
 * Este componente renderiza HTML diretamente usando dangerouslySetInnerHTML
 * sem nenhuma sanitização.
 *
 * Durante o curso (Módulo 1 - Vídeo 1.4), vamos corrigir isso adicionando:
 * - DOMPurify para sanitização
 * - Lista de tags permitidas
 * - Validação de atributos
 */
export function UserBio({ bio }) {
  if (!bio) {
    return null;
  }

  return (
    <div className={styles.bioContainer}>
      <h3 className={styles.bioTitle}>Bio</h3>
      {/* ⚠️ PERIGO: dangerouslySetInnerHTML sem sanitização */}
      <div
        className={styles.bioContent}
        dangerouslySetInnerHTML={{ __html: bio }}
      />
    </div>
  );
}
